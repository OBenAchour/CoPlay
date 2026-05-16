import cv2
import json
import os
import time
import numpy as np
from typing import Optional, Dict
import subprocess
import shutil
import platform
import logging
from pathlib import Path

from detector import Detector, Detection, PERSON_CLS, BALL_CLS
from classifier import (
    TeamClassifier,
    LABEL_TEAM1, LABEL_TEAM2, LABEL_REFEREE,
    LABEL_GK_TEAM1, LABEL_GK_TEAM2, LABEL_UNKNOWN,
)
from possession import PossessionEngine

COLORS = {
    LABEL_TEAM1:    (255, 100, 50),
    LABEL_TEAM2:    (50, 50, 255),
    LABEL_GK_TEAM1: (50, 255, 50),
    LABEL_GK_TEAM2: (50, 255, 50),
    LABEL_REFEREE:  (0, 255, 255),
    LABEL_UNKNOWN:  (180, 180, 180),
    "Ball":         (0, 165, 255),
}


def get_color(label: str) -> tuple:
    return COLORS.get(label, (180, 180, 180))


class FootballAnalytics:

    def __init__(
        self,
        model_path: str = "yolo11n.pt",
        conf: float = 0.3,
        init_frames: int = 60,
        possession_threshold: float = 300.0,
        output_dir: str = "output",
        jersey_colors: Optional[Dict] = None,
        team1_name: str = "Team 1",
        team2_name: str = "Team 2",
    ):
        print(f"[Analytics] Initializing with Team Names: {team1_name} vs {team2_name}", flush=True)
        self.team1_name = team1_name
        self.team2_name = team2_name
        self.model_path = model_path
        self.conf = conf
        self.init_frames = init_frames
        self.possession_threshold = possession_threshold
        self.output_dir = output_dir
        self.jersey_colors = jersey_colors

        os.makedirs(output_dir, exist_ok=True)

        self.detector = Detector(model_path=model_path, conf=conf)
        self.classifier = TeamClassifier(init_frames=init_frames)
        self.possession = PossessionEngine(proximity_threshold=possession_threshold)

        if jersey_colors:
            self._apply_jersey_colors(jersey_colors)

    def _apply_jersey_colors(self, jersey_colors: Dict):
        if "team1" in jersey_colors and "team2" in jersey_colors:
            t1_bgr = np.array(jersey_colors["team1"], dtype=np.float32)
            t2_bgr = np.array(jersey_colors["team2"], dtype=np.float32)

            t1_img = np.zeros((10, 10, 3), dtype=np.uint8)
            t1_img[:] = t1_bgr
            t2_img = np.zeros((10, 10, 3), dtype=np.uint8)
            t2_img[:] = t2_bgr

            t1_hsv = cv2.cvtColor(t1_img, cv2.COLOR_BGR2HSV)
            t2_hsv = cv2.cvtColor(t2_img, cv2.COLOR_BGR2HSV)

            t1_hist_h = cv2.calcHist([t1_hsv], [0], None, [16], [0, 180]).flatten()
            t1_hist_s = cv2.calcHist([t1_hsv], [1], None, [8], [0, 256]).flatten()
            t1_feat = np.concatenate([t1_hist_h, t1_hist_s]).astype(np.float32)
            total1 = np.sum(t1_feat)
            if total1 > 0:
                t1_feat /= total1

            t2_hist_h = cv2.calcHist([t2_hsv], [0], None, [16], [0, 180]).flatten()
            t2_hist_s = cv2.calcHist([t2_hsv], [1], None, [8], [0, 256]).flatten()
            t2_feat = np.concatenate([t2_hist_h, t2_hist_s]).astype(np.float32)
            total2 = np.sum(t2_feat)
            if total2 > 0:
                t2_feat /= total2

            ref_feat = np.ones(24, dtype=np.float32) / 24.0

            from sklearn.cluster import KMeans
            self.classifier.cluster_centers = {0: t1_feat, 1: t2_feat, 2: ref_feat}
            self.classifier.cluster_labels = {0: LABEL_TEAM1, 1: LABEL_TEAM2, 2: LABEL_REFEREE}
            self.classifier.trained = True
            print(f"[Analytics] Jersey colors applied from API: team1={jersey_colors['team1']}, team2={jersey_colors['team2']}", flush=True)

    def process_image(self, image_path: str) -> str:
        print(f"\n[Analytics] Processing image: {image_path}", flush=True)
        img = cv2.imread(image_path)
        if img is None:
            raise FileNotFoundError(f"Cannot read image: {image_path}")

        detections = self.detector.detect_image(img)

        img_classifier = TeamClassifier(init_frames=1)

        if self.jersey_colors:
            self._apply_jersey_colors_to_classifier(img_classifier, self.jersey_colors)
        else:
            persons = [d for d in detections if d.cls == PERSON_CLS]
            for det in persons:
                feat = img_classifier.extract_features(img, det.bbox)
                if feat is not None:
                    img_classifier.add_sample(feat)
            img_classifier.frame_count = 1
            if len(img_classifier.feature_samples) >= 6:
                img_classifier.trained = False
                img_classifier._train_with_min(len(img_classifier.feature_samples))

        stats = {LABEL_TEAM1: 0, LABEL_TEAM2: 0, LABEL_REFEREE: 0, LABEL_UNKNOWN: 0}

        for det in detections:
            if det.cls == PERSON_CLS:
                feat = img_classifier.extract_features(img, det.bbox)
                label = img_classifier.classify(None, feat)
                det.label = label
                stats[label] = stats.get(label, 0) + 1
                self._draw_person(img, det, label, None)
            elif det.cls == BALL_CLS:
                det.label = "Ball"
                self._draw_ball(img, det)

        basename = os.path.splitext(os.path.basename(image_path))[0]
        output_path = os.path.join(self.output_dir, f"detected_{basename}.jpg")
        cv2.imwrite(output_path, img)
        print(f"[Analytics] Image saved: {output_path}", flush=True)

        json_data = {"image": stats}
        json_path = os.path.join(self.output_dir, "statistics.json")
        with open(json_path, "w") as f:
            json.dump(json_data, f, indent=4)
        print(f"[Analytics] Stats saved: {json_path}", flush=True)

        return output_path

    def _apply_jersey_colors_to_classifier(self, classifier, jersey_colors):
        if "team1" in jersey_colors and "team2" in jersey_colors:
            t1_bgr = np.array(jersey_colors["team1"], dtype=np.float32)
            t2_bgr = np.array(jersey_colors["team2"], dtype=np.float32)

            t1_img = np.zeros((10, 10, 3), dtype=np.uint8)
            t1_img[:] = t1_bgr
            t2_img = np.zeros((10, 10, 3), dtype=np.uint8)
            t2_img[:] = t2_bgr

            t1_hsv = cv2.cvtColor(t1_img, cv2.COLOR_BGR2HSV)
            t2_hsv = cv2.cvtColor(t2_img, cv2.COLOR_BGR2HSV)

            t1_hist_h = cv2.calcHist([t1_hsv], [0], None, [16], [0, 180]).flatten()
            t1_hist_s = cv2.calcHist([t1_hsv], [1], None, [8], [0, 256]).flatten()
            t1_feat = np.concatenate([t1_hist_h, t1_hist_s]).astype(np.float32)
            total1 = np.sum(t1_feat)
            if total1 > 0:
                t1_feat /= total1

            t2_hist_h = cv2.calcHist([t2_hsv], [0], None, [16], [0, 180]).flatten()
            t2_hist_s = cv2.calcHist([t2_hsv], [1], None, [8], [0, 256]).flatten()
            t2_feat = np.concatenate([t2_hist_h, t2_hist_s]).astype(np.float32)
            total2 = np.sum(t2_feat)
            if total2 > 0:
                t2_feat /= total2

            ref_feat = np.ones(24, dtype=np.float32) / 24.0

            classifier.cluster_centers = {0: t1_feat, 1: t2_feat, 2: ref_feat}
            classifier.cluster_labels = {0: LABEL_TEAM1, 1: LABEL_TEAM2, 2: LABEL_REFEREE}
            classifier.trained = True

    def process_video(
        self,
        video_path: str,
        max_seconds: float = 0,
        frame_skip: int = 1,
        progress_callback=None,
    ) -> dict:
        print(f"\n[Analytics] Processing video: {video_path}", flush=True)

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise FileNotFoundError(f"Cannot open video: {video_path}")

        fps = int(cap.get(cv2.CAP_PROP_FPS)) or 25
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        if max_seconds > 0:
            max_frames = int(max_seconds * fps)
        else:
            max_frames = total_video_frames

        print(f"[Analytics] Video: {w}x{h} @ {fps}fps, {total_video_frames} total frames", flush=True)
        print(f"[Analytics] Processing up to {max_frames} frames (skip={frame_skip})", flush=True)

        basename = os.path.splitext(os.path.basename(video_path))[0]
        output_path = os.path.join(self.output_dir, f"output_{basename}.mp4")
        
        fourcc = cv2.VideoWriter_fourcc(*'avc1')
        out = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
        
        if not out.isOpened():
            print(f"[Analytics] Warning: avc1 codec failed. Falling back to mp4v.", flush=True)
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (w, h))
            
        if not out.isOpened():
            print(f"[Analytics] Error: Could not open VideoWriter with any codec.", flush=True)
            raise RuntimeError("Could not initialize VideoWriter. Check system video codecs.")

        self.classifier = TeamClassifier(init_frames=self.init_frames)
        self.possession = PossessionEngine(proximity_threshold=self.possession_threshold)

        if self.jersey_colors:
            self._apply_jersey_colors(self.jersey_colors)

        start_time = time.time()
        processed = 0
        frame_idx = 0

        try:
            while frame_idx < max_frames:
                ret, frame = cap.read()
                if not ret:
                    break

                frame_idx += 1

                if frame_skip > 1 and (frame_idx % frame_skip) != 1:
                    out.write(frame)
                    continue

                processed += 1

                detections = self.detector.detect_and_track(frame)

                if not self.classifier.trained:
                    self.classifier.increment_frame()
                    for det in detections:
                        if det.cls == PERSON_CLS:
                            feat = self.classifier.extract_features(frame, det.bbox)
                            if feat is not None:
                                self.classifier.add_sample(feat)

                    if self.classifier.should_train():
                        self.classifier.train()

                for det in detections:
                    if det.cls == PERSON_CLS:
                        feat = self.classifier.extract_features(frame, det.bbox)
                        label = self.classifier.classify(det.track_id, feat)
                        det.label = label
                        display_label = self.classifier.get_label_for_display(det.track_id, label)
                        self._draw_person(frame, det, label, display_label)
                    elif det.cls == BALL_CLS:
                        det.label = "Ball"
                        self._draw_ball(frame, det)

                current_poss = self.possession.update(detections, self._get_track_label)
                self._draw_hud(frame, current_poss, frame_idx, max_frames)
                self.classifier.detect_goalkeepers(frame_idx)

                out.write(frame)

                if progress_callback:
                    progress_callback(frame_idx, max_frames)

                if processed % 50 == 0:
                    elapsed = time.time() - start_time
                    fps_actual = processed / elapsed if elapsed > 0 else 0
                    print(
                        f"[Analytics] Frame {frame_idx}/{max_frames} "
                        f"({processed} processed, {fps_actual:.1f} fps)",
                        flush=True,
                    )

        finally:
            cap.release()
            out.release()

        # Fail-Safe Post-Processing Hook: Ensure H.264 + FastStart for web players
        output_path = self._optimize_video_for_web(output_path)

        elapsed = time.time() - start_time
        print(f"\n[Analytics] Video done in {elapsed:.1f}s ({processed} frames processed)", flush=True)
        print(f"[Analytics] Output: {output_path}", flush=True)

        stats = self._build_stats(frame_idx)
        json_path = os.path.join(self.output_dir, "statistics.json")
        with open(json_path, "w") as f:
            json.dump(stats, f, indent=4)
        print(f"[Analytics] Stats: {json_path}", flush=True)

        return {"output_path": output_path, "stats": stats}

    def _get_track_label(self, tid: int) -> str:
        from collections import Counter
        if tid in self.classifier.gk_track_ids:
            return self.classifier.gk_track_ids[tid]
        if tid in self.classifier.locked_labels:
            return self.classifier.locked_labels[tid]
        votes = self.classifier.track_votes.get(tid, [])
        if votes:
            return Counter(votes).most_common(1)[0][0]
        return LABEL_UNKNOWN

    def _draw_person(self, frame, det: Detection, label: str, display_label: Optional[str]):
        x1, y1, x2, y2 = map(int, det.bbox)
        color = get_color(label)
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        text = display_label if display_label else label
        
        # Replace default labels with real team names
        if label == LABEL_TEAM1:
            text = text.replace(LABEL_TEAM1, self.team1_name)
        elif label == LABEL_TEAM2:
            text = text.replace(LABEL_TEAM2, self.team2_name)
        elif label == LABEL_GK_TEAM1:
            text = text.replace(LABEL_GK_TEAM1, f"GK {self.team1_name}")
        elif label == LABEL_GK_TEAM2:
            text = text.replace(LABEL_GK_TEAM2, f"GK {self.team2_name}")

        font_scale = 0.5
        thickness = 1
        (tw, th), baseline = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)
        cv2.rectangle(frame, (x1, y1 - th - 8), (x1 + tw + 4, y1), color, -1)
        cv2.putText(frame, text, (x1 + 2, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX,
                    font_scale, (255, 255, 255), thickness, cv2.LINE_AA)

    def _draw_ball(self, frame, det: Detection):
        cx, cy = int(det.center[0]), int(det.center[1])
        color = COLORS["Ball"]
        cv2.circle(frame, (cx, cy), 12, color, -1)
        cv2.circle(frame, (cx, cy), 12, (255, 255, 255), 2)
        cv2.putText(frame, "Ball", (cx - 15, cy - 16), cv2.FONT_HERSHEY_SIMPLEX,
                    0.5, (255, 255, 255), 1, cv2.LINE_AA)

    def _draw_hud(self, frame, current_possession: Optional[str], frame_idx: int, total_frames: int):
        h, w = frame.shape[:2]
        stats = self.possession.get_stats()

        overlay = frame.copy()
        cv2.rectangle(overlay, (10, 10), (400, 90), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.6, frame, 0.4, 0, frame)

        cv2.putText(frame, "POSSESSION", (20, 32), cv2.FONT_HERSHEY_SIMPLEX,
                    0.5, (255, 255, 255), 1, cv2.LINE_AA)

        pct1_str = stats["possession"][LABEL_TEAM1]
        pct1 = float(pct1_str.replace("%", ""))
        bar_w = int(pct1 / 100.0 * 200)
        cv2.rectangle(frame, (20, 42), (20 + bar_w, 58), COLORS[LABEL_TEAM1], -1)
        cv2.putText(frame, f"{self.team1_name}: {pct1_str}", (230, 56), cv2.FONT_HERSHEY_SIMPLEX,
                    0.4, (255, 255, 255), 1, cv2.LINE_AA)

        pct2_str = stats["possession"][LABEL_TEAM2]
        pct2 = float(pct2_str.replace("%", ""))
        bar_w2 = int(pct2 / 100.0 * 200)
        cv2.rectangle(frame, (20, 64), (20 + bar_w2, 80), COLORS[LABEL_TEAM2], -1)
        cv2.putText(frame, f"{self.team2_name}: {pct2_str}", (230, 78), cv2.FONT_HERSHEY_SIMPLEX,
                    0.4, (255, 255, 255), 1, cv2.LINE_AA)

        cv2.putText(frame, f"Frame: {frame_idx}/{total_frames}",
                    (w - 200, h - 20), cv2.FONT_HERSHEY_SIMPLEX,
                    0.4, (200, 200, 200), 1, cv2.LINE_AA)

    def _build_stats(self, total_frames: int) -> dict:
        cls_stats = self.classifier.get_stats()
        poss_stats = self.possession.get_stats()

        result = {
            "video": {
                "total_frames": total_frames,
                "possession": poss_stats["possession"],
                "possession_frames": poss_stats["possession_frames"],
                "goalkeeper_frames": cls_stats["goalkeeper_frames"],
                "referee_frames": cls_stats["referee_frames"],
            },
            "detections": {
                "players": cls_stats["players"],
            },
        }

        print("\n" + "=" * 50, flush=True)
        print("  MATCH ANALYTICS SUMMARY", flush=True)
        print("=" * 50, flush=True)
        print(f"  Total frames:    {total_frames}", flush=True)
        print(f"  Possession:", flush=True)
        print(f"    Team 1:        {poss_stats['possession'][LABEL_TEAM1]}", flush=True)
        print(f"    Team 2:        {poss_stats['possession'][LABEL_TEAM2]}", flush=True)
        print(f"  Players detected:", flush=True)
        print(f"    Team 1:        {cls_stats['players'][LABEL_TEAM1]} unique IDs", flush=True)
        print(f"    Team 2:        {cls_stats['players'][LABEL_TEAM2]} unique IDs", flush=True)
        print(f"  GK frames:", flush=True)
        print(f"    Team 1:        {cls_stats['goalkeeper_frames'][LABEL_TEAM1]}", flush=True)
        print(f"    Team 2:        {cls_stats['goalkeeper_frames'][LABEL_TEAM2]}", flush=True)
        print(f"  Referee frames:  {cls_stats['referee_frames']}", flush=True)
        print("=" * 50 + "\n", flush=True)

        return result

    def _get_ffmpeg_executable(self) -> Optional[str]:
        """
        Resolves the FFmpeg executable path with Windows compatibility and fallback.
        Ensures the binary is a valid Win32 application to avoid WinError 193.
        """
        # 1. Determine local path based on OS
        # We check both ffmpeg.exe and ffmpeg (for cases where extension is missing)
        local_dir = Path(__file__).parent / "bin"
        
        potential_locals = []
        if platform.system() == "Windows":
            potential_locals.append(local_dir / "ffmpeg.exe")
            potential_locals.append(local_dir / "ffmpeg") # Check if it's named without extension
        else:
            potential_locals.append(local_dir / "ffmpeg")

        for local_path in potential_locals:
            if local_path.exists():
                try:
                    # Validate by checking version. On Windows, this will catch WinError 193 immediately.
                    # We use creationflags=subprocess.CREATE_NO_WINDOW on Windows to keep it silent if needed,
                    # but here we just want to see if it runs.
                    subprocess.run(
                        [str(local_path), "-version"], 
                        capture_output=True, 
                        text=True, 
                        check=True,
                        timeout=5
                    )
                    print(f"[Analytics] Validated local FFmpeg found: {local_path}", flush=True)
                    return str(local_path)
                except (subprocess.CalledProcessError, OSError, subprocess.TimeoutExpired) as e:
                    print(f"[Analytics] Warning: Local binary at {local_path} is invalid or incompatible: {e}", flush=True)
                    if isinstance(e, OSError) and getattr(e, 'winerror', None) == 193:
                        print(f"[Analytics] Root Cause: {local_path} is not a valid Windows application (likely Linux binary).", flush=True)

        # 2. Fallback to system PATH
        system_ffmpeg = shutil.which("ffmpeg")
        if system_ffmpeg:
            print(f"[Analytics] Falling back to system FFmpeg: {system_ffmpeg}", flush=True)
            return system_ffmpeg

        return None

    def _optimize_video_for_web(self, input_path: str) -> str:
        """
        Optimizes video using FFmpeg for web playback (H.264, FastStart).
        """
        if not os.path.exists(input_path):
            print(f"[Analytics] Error: Input file for optimization missing: {input_path}", flush=True)
            return input_path

        ffmpeg_exe = self._get_ffmpeg_executable()
        if not ffmpeg_exe:
            print(f"[Analytics] Skip optimization: FFmpeg not found or invalid.", flush=True)
            return input_path

        temp_output = str(Path(input_path).with_name(f"{Path(input_path).stem}_optimized.mp4"))
        
        # Production-grade FFmpeg command
        cmd = [
            ffmpeg_exe, "-y", 
            "-loglevel", "error",     # Keep output clean
            "-i", input_path,
            "-vcodec", "libx264",
            "-pix_fmt", "yuv420p",    # Required for broad player compatibility
            "-movflags", "+faststart", # Metadata at start for streaming
            "-crf", "23",             # Balanced quality/size
            "-preset", "veryfast",    # Performance over compression ratio
            temp_output
        ]

        print(f"[Analytics] Optimizing video for web: {input_path} -> {temp_output}", flush=True)
        try:
            # On Windows, using shell=False (default) and a list is safer.
            # We use capture_output=True to handle errors gracefully.
            result = subprocess.run(cmd, capture_output=True, text=True, check=False)
            
            if result.returncode == 0 and os.path.exists(temp_output):
                # Use os.replace for atomic overwrite (works across filesystems better than rename)
                os.replace(temp_output, input_path)
                print(f"[Analytics] Web optimization complete: {input_path}", flush=True)
            else:
                print(f"[Analytics] FFmpeg optimization failed (Code {result.returncode})", flush=True)
                if result.stderr:
                    print(f"[Analytics] FFmpeg Error: {result.stderr.strip()}", flush=True)
        except Exception as e:
            print(f"[Analytics] Unexpected error during FFmpeg execution: {e}", flush=True)
        finally:
            # Cleanup temp file if it still exists (e.g. if replace failed)
            if os.path.exists(temp_output):
                try: os.remove(temp_output)
                except: pass

        return input_path
