import cv2
import numpy as np
from collections import Counter, defaultdict
from sklearn.cluster import KMeans
from typing import Optional, Dict, Tuple

LABEL_TEAM1 = "Team 1"
LABEL_TEAM2 = "Team 2"
LABEL_REFEREE = "Referee"
LABEL_GK_TEAM1 = "GK Team 1"
LABEL_GK_TEAM2 = "GK Team 2"
LABEL_UNKNOWN = "Unknown"


class TeamClassifier:

    def __init__(self, init_frames: int = 60, lock_threshold: float = 0.70):
        self.init_frames = init_frames
        self.lock_threshold = lock_threshold

        self.trained = False
        self.cluster_centers = {}
        self.cluster_labels = {}

        self.feature_samples = []
        self.frame_count = 0

        self.track_votes = defaultdict(list)
        self.locked_labels = {}

        self.gk_candidates = defaultdict(int)
        self.gk_track_ids = {}
        self.gk_detection_started = False
        self.track_features = defaultdict(list)

        self.team_track_ids = {LABEL_TEAM1: set(), LABEL_TEAM2: set()}
        self.gk_frame_counts = {LABEL_TEAM1: 0, LABEL_TEAM2: 0}
        self.referee_frame_count = 0

    def extract_features(self, frame, bbox: tuple) -> Optional[np.ndarray]:
        try:
            x1, y1, x2, y2 = map(int, bbox)
            h_frame, w_frame = frame.shape[:2]
            x1 = max(0, x1)
            y1 = max(0, y1)
            x2 = min(w_frame, x2)
            y2 = min(h_frame, y2)

            roi = frame[y1:y2, x1:x2]
            if roi.size == 0:
                return None

            h_roi, w_roi = roi.shape[:2]
            if h_roi < 10 or w_roi < 10:
                return None

            top = int(h_roi * 0.2)
            bottom = int(h_roi * 0.5)
            left = int(w_roi * 0.3)
            right = int(w_roi * 0.7)
            jersey = roi[top:bottom, left:right]

            if jersey.size == 0 or jersey.shape[0] < 4 or jersey.shape[1] < 4:
                return None

            lab = cv2.cvtColor(jersey, cv2.COLOR_BGR2LAB)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(4, 4))
            lab[:, :, 0] = clahe.apply(lab[:, :, 0])
            jersey_norm = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

            hsv = cv2.cvtColor(jersey_norm, cv2.COLOR_BGR2HSV)

            green_lower = np.array([30, 35, 35])
            green_upper = np.array([90, 255, 255])
            grass_mask = cv2.inRange(hsv, green_lower, green_upper)
            non_grass_mask = cv2.bitwise_not(grass_mask)

            if np.count_nonzero(non_grass_mask) < 20:
                return None

            h_hist = cv2.calcHist([hsv], [0], non_grass_mask, [16], [0, 180])
            s_hist = cv2.calcHist([hsv], [1], non_grass_mask, [8], [0, 256])

            feature = np.concatenate([h_hist.flatten(), s_hist.flatten()])
            total = np.sum(feature)
            if total > 0:
                feature = feature / total

            return feature.astype(np.float32)

        except Exception:
            return None

    def add_sample(self, feature: np.ndarray):
        if feature is not None:
            self.feature_samples.append(feature)

    def increment_frame(self):
        self.frame_count += 1

    def should_train(self) -> bool:
        return (not self.trained and
                self.frame_count >= self.init_frames and
                len(self.feature_samples) >= 20)

    def _train_with_min(self, min_samples: int = 6):
        if len(self.feature_samples) < min_samples:
            print(f"[Classifier] Not enough samples ({len(self.feature_samples)} < {min_samples}).", flush=True)
            return False
        return self._do_train()

    def train(self):
        if len(self.feature_samples) < 20:
            print(f"[Classifier] Not enough samples to train ({len(self.feature_samples)} < 20).", flush=True)
            return False
        return self._do_train()

    def _do_train(self):
        data = np.array(self.feature_samples)
        n_clusters = 3

        try:
            kmeans = KMeans(n_clusters=n_clusters, n_init=10, random_state=42)
            kmeans.fit(data)

            counts = np.bincount(kmeans.labels_, minlength=n_clusters)
            sorted_indices = np.argsort(counts)[::-1]

            self.cluster_labels = {
                sorted_indices[0]: LABEL_TEAM1,
                sorted_indices[1]: LABEL_TEAM2,
                sorted_indices[2]: LABEL_REFEREE,
            }

            self.cluster_centers = {
                i: kmeans.cluster_centers_[i] for i in range(n_clusters)
            }

            self.trained = True
            print(f"[Classifier] Trained on {len(data)} samples.", flush=True)
            print(f"[Classifier] Cluster sizes: {dict(zip([self.cluster_labels[i] for i in sorted_indices], counts[sorted_indices]))}", flush=True)
            return True

        except Exception as e:
            print(f"[Classifier] Training failed: {e}", flush=True)
            return False

    def classify(self, track_id: Optional[int], feature: Optional[np.ndarray]) -> str:
        if track_id is not None and track_id in self.gk_track_ids:
            label = self.gk_track_ids[track_id]
            self._update_stats(track_id, label)
            return label

        if track_id is not None and track_id in self.locked_labels:
            label = self.locked_labels[track_id]
            self._update_stats(track_id, label)
            return label

        if not self.trained or feature is None:
            return LABEL_UNKNOWN

        raw_label = self._nearest_cluster(feature)

        if track_id is None:
            return raw_label

        self.track_features[track_id].append(feature)
        if len(self.track_features[track_id]) > 50:
            self.track_features[track_id] = self.track_features[track_id][-50:]

        self.track_votes[track_id].append(raw_label)
        if len(self.track_votes[track_id]) > 30:
            self.track_votes[track_id] = self.track_votes[track_id][-30:]

        votes = self.track_votes[track_id]
        counter = Counter(votes)
        majority_label, majority_count = counter.most_common(1)[0]
        majority_ratio = majority_count / len(votes)

        if majority_ratio >= self.lock_threshold and len(votes) >= 15:
            self.locked_labels[track_id] = majority_label

        self._update_stats(track_id, majority_label)
        return majority_label

    def _nearest_cluster(self, feature: np.ndarray) -> str:
        best_dist = float("inf")
        best_label = LABEL_UNKNOWN

        for idx, center in self.cluster_centers.items():
            dot = np.dot(feature, center)
            norm_f = np.linalg.norm(feature)
            norm_c = np.linalg.norm(center)
            if norm_f > 0 and norm_c > 0:
                cos_sim = dot / (norm_f * norm_c)
                dist = 1.0 - cos_sim
            else:
                dist = float("inf")

            if dist < best_dist:
                best_dist = dist
                best_label = self.cluster_labels.get(idx, LABEL_UNKNOWN)

        return best_label

    def _update_stats(self, track_id, label):
        if label in (LABEL_TEAM1, LABEL_TEAM2):
            self.team_track_ids[label].add(track_id)
        if label == LABEL_REFEREE:
            self.referee_frame_count += 1
        if label in (LABEL_GK_TEAM1, LABEL_GK_TEAM2):
            team = LABEL_TEAM1 if label == LABEL_GK_TEAM1 else LABEL_TEAM2
            self.gk_frame_counts[team] += 1
            self.team_track_ids[team].add(track_id)

    def detect_goalkeepers(self, frame_idx: int):
        if not self.trained or frame_idx < self.init_frames + 50:
            return

        if self.gk_detection_started:
            return

        for team_label in (LABEL_TEAM1, LABEL_TEAM2):
            team_center = None
            for idx, label in self.cluster_labels.items():
                if label == team_label:
                    team_center = self.cluster_centers[idx]
                    break

            if team_center is None:
                continue

            best_track = None
            best_dist = 0.0

            for tid, label in self.locked_labels.items():
                if label != team_label:
                    continue
                if tid not in self.track_features or len(self.track_features[tid]) < 10:
                    continue

                avg_feature = np.mean(self.track_features[tid], axis=0)

                dot = np.dot(avg_feature, team_center)
                norm_f = np.linalg.norm(avg_feature)
                norm_c = np.linalg.norm(team_center)
                if norm_f > 0 and norm_c > 0:
                    dist = 1.0 - (dot / (norm_f * norm_c))
                else:
                    dist = 0.0

                if dist > best_dist:
                    best_dist = dist
                    best_track = tid

            if best_track is not None and best_dist > 0.05:
                gk_label = LABEL_GK_TEAM1 if team_label == LABEL_TEAM1 else LABEL_GK_TEAM2
                self.gk_track_ids[best_track] = gk_label
                if best_track in self.locked_labels:
                    del self.locked_labels[best_track]
                print(f"[Classifier] Goalkeeper detected: Track {best_track} -> {gk_label} (dist={best_dist:.4f})", flush=True)

        self.gk_detection_started = True

    def get_label_for_display(self, track_id: Optional[int], base_label: str) -> str:
        if track_id is None:
            return base_label
        if base_label in (LABEL_GK_TEAM1, LABEL_GK_TEAM2):
            return base_label
        if base_label == LABEL_REFEREE:
            return LABEL_REFEREE
        if base_label in (LABEL_TEAM1, LABEL_TEAM2):
            return f"{base_label} | ID: {track_id}"
        return base_label

    def get_stats(self) -> dict:
        return {
            "players": {
                LABEL_TEAM1: len(self.team_track_ids[LABEL_TEAM1]),
                LABEL_TEAM2: len(self.team_track_ids[LABEL_TEAM2]),
            },
            "goalkeeper_frames": {
                LABEL_TEAM1: self.gk_frame_counts[LABEL_TEAM1],
                LABEL_TEAM2: self.gk_frame_counts[LABEL_TEAM2],
            },
            "referee_frames": self.referee_frame_count,
        }
