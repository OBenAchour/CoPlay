"""
⚠️  DEPRECATED — This file is kept for reference only.
Use the new modular pipeline instead:
    python main.py --input data/video.mp4 [options]

New modules: detector.py, classifier.py, possession.py, analytics.py, main.py
"""

import cv2
import numpy as np
import json
import os
import sys
from collections import Counter
from ultralytics import YOLO
from sklearn.cluster import KMeans

# Set device to CPU
device = 'cpu'

class TeamClassifier:
    def __init__(self):
        self.team_colors = {}
        self.color_samples = []
        self.trained = False
        self.cluster_labels = {}
        self.player_history = {} # {track_id: [detected_labels]}

    def get_player_color(self, frame, box):
        try:
            x1, y1, x2, y2 = map(int, box)
            roi = frame[y1:y2, x1:x2]
            if roi.size == 0: return None
            h, w = roi.shape[:2]
            chest = roi[int(h*0.2):int(h*0.5), int(w*0.3):int(w*0.7)]
            if chest.size == 0: return None
            
            hsv = cv2.cvtColor(chest, cv2.COLOR_BGR2HSV)
            # Filter green grass
            mask = cv2.inRange(hsv, (30, 35, 35), (90, 255, 255))
            mask_inv = cv2.bitwise_not(mask)
            
            if np.count_nonzero(mask_inv) > 0:
                avg = cv2.mean(chest, mask=mask_inv)[:3]
                return np.array(avg)
            return np.mean(chest.reshape(-1, 3), axis=0)
        except: return None

    def train(self, samples=None):
        data = samples if samples is not None else [s[1] for s in self.color_samples]
        if len(data) < 20: return
        try:
            n = 3 # Team 1, Team 2, Referee/Other
            kmeans = KMeans(n_clusters=n, n_init=10).fit(data)
            counts = np.bincount(kmeans.labels_)
            idx = np.argsort(counts)[::-1]
            
            self.cluster_labels = {idx[0]: "Team 1"}
            if n > 1: self.cluster_labels[idx[1]] = "Team 2"
            if n > 2: self.cluster_labels[idx[2]] = "Referee"
            
            self.team_colors = {i: kmeans.cluster_centers_[i] for i in range(len(kmeans.cluster_centers_))}
            self.trained = True
            print(f"Classifier trained. Clusters mapping: {self.cluster_labels}", flush=True)
        except: pass

    def get_label(self, track_id, color, gx, gy):
        # 1. Spatial GK check
        if (gx < 90 or gx > 810) and (210 < gy < 390):
            return "Goalkeeper"
        
        # 2. Team classification
        raw_label = "Other"
        if self.trained and color is not None:
            dists = [np.linalg.norm(color - c) for c in self.team_colors.values()]
            raw_label = self.cluster_labels.get(np.argmin(dists), "Other")
        
        # 3. Voting logic (Smoothing)
        if track_id is not None:
            if track_id not in self.player_history:
                self.player_history[track_id] = []
            self.player_history[track_id].append(raw_label)
            # Return majority vote from last 30 detections
            votes = self.player_history[track_id][-30:]
            return Counter(votes).most_common(1)[0][0]
            
        return raw_label

class Analytics:
    def __init__(self, model_path='yolo11x.pt'): # UPGRADED TO X-LARGE
        print(f"Loading {model_path} for maximum precision...", flush=True)
        self.model = YOLO(model_path)
        self.classifier = TeamClassifier()
        self.matrix = np.array([[2.56e-01, 5.9e-01, 1.94e+02], [-1.3e-02, 1.37e+00, -8.3e+01], [-3.4e-05, 1.3e-03, 1.0e+00]])
        self.results = {"video": {}, "image": {}}

    def project(self, x, y):
        pts = np.float32([[x, y]])
        proj = cv2.perspectiveTransform(pts[None, :, :], self.matrix)
        return int(proj[0][0][0]), int(proj[0][0][1])

    def process_image(self, path):
        img = cv2.imread(path)
        if img is None: return
        res = self.model(img, verbose=False, device=device)[0]
        players = [b.xyxy[0].cpu().numpy() for b in res.boxes if b.cls == 0]
        
        img_colors = [self.classifier.get_player_color(img, b) for b in players]
        img_colors = [c for c in img_colors if c is not None]
        
        img_clf = TeamClassifier()
        img_clf.train(img_colors)
        
        stats = {"Team 1": 0, "Team 2": 0, "Goalkeeper": 0, "Referee": 0, "Other": 0}
        for b in players:
            c = img_clf.get_player_color(img, b)
            gx, gy = self.project((b[0]+b[2])/2, b[3])
            label = img_clf.get_label(None, c, gx, gy)
            stats[label] += 1
            x1, y1, x2, y2 = map(int, b)
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(img, label, (x1, y1-10), 0, 0.6, (0, 255, 0), 2)
            
        cv2.imwrite('output/detected_temp.jpg', img)
        self.results["image"] = stats

    def run_video(self, path, sec=30):
        cap = cv2.VideoCapture(path)
        fps, w, h = int(cap.get(5)), int(cap.get(3)), int(cap.get(4))
        out = cv2.VideoWriter('output/output_analytics.mp4', cv2.VideoWriter_fourcc(*'avc1'), fps, (w, h))
        stats = {"Team 1": 0, "Team 2": 0, "Goalkeeper": 0, "Referee": 0, "Other": 0, "frames": 0}
        
        num_frames = int(sec * fps)
        for i in range(num_frames):
            ret, frame = cap.read()
            if not ret: break
            tracks = self.model.track(frame, persist=True, verbose=False, device=device, conf=0.25)[0]
            
            if tracks.boxes.id is not None:
                for b, tid, cl in zip(tracks.boxes.xyxy.cpu().numpy(), tracks.boxes.id.cpu().numpy(), tracks.boxes.cls.cpu().numpy()):
                    if cl == 0:
                        color = self.classifier.get_player_color(frame, b)
                        gx, gy = self.project((b[0]+b[2])/2, b[3])
                        
                        if not self.classifier.trained and color is not None:
                            self.classifier.color_samples.append((tid, color))
                            if len(self.classifier.color_samples) >= 50: self.classifier.train()
                        
                        label = self.classifier.get_label(tid, color, gx, gy)
                        stats[label] += 1
                        cv2.rectangle(frame, (int(b[0]), int(b[1])), (int(b[2]), int(b[3])), (255,255,255), 2)
                        cv2.putText(frame, label, (int(b[0]), int(b[1])-10), 0, 0.5, (255,255,255), 2)
                    elif cl == 32:
                        bx, by = int((b[0]+b[2])/2), int((b[1]+b[3])/2)
                        cv2.circle(frame, (bx, by), 10, (0, 255, 255), -1)
            
            out.write(frame)
            stats["frames"] += 1
            if i % 50 == 0: print(f"Frame {i}/{num_frames}...", flush=True)
            
        cap.release(); out.release()
        total_p = stats["Team 1"] + stats["Team 2"] + stats["Other"] or 1
        self.results["video"] = {
            "possession": {"Team 1": f"{(stats['Team 1']/total_p)*100:.1f}%", "Team 2": f"{(stats['Team 2']/total_p)*100:.1f}%"},
            "goalkeeper_frames": stats["Goalkeeper"],
            "referee_frames": stats["Referee"]
        }
        with open('output/statistics.json', 'w') as f: json.dump(self.results, f, indent=4)
        print("Done.", flush=True)

if __name__ == "__main__":
    os.makedirs('output', exist_ok=True)
    engine = Analytics()
    engine.process_image('data/temp.jpg')
    engine.run_video('data/video.mp4')
