import numpy as np
from collections import deque
from typing import Optional, Tuple, Dict, List
from detector import Detection, PERSON_CLS, BALL_CLS
from classifier import LABEL_TEAM1, LABEL_TEAM2, LABEL_REFEREE, LABEL_GK_TEAM1, LABEL_GK_TEAM2, LABEL_UNKNOWN


class PossessionEngine:

    def __init__(self, proximity_threshold: float = 150.0, smoothing_window: int = 10,
                 interpolation_limit: int = 5):
        self.proximity_threshold = proximity_threshold
        self.smoothing_window = smoothing_window
        self.interpolation_limit = interpolation_limit

        self.ball_history: List[Optional[Tuple[float, float]]] = []
        self.last_valid_ball: Optional[Tuple[float, float]] = None
        self.missing_ball_count = 0

        self.raw_possession_buffer = deque(maxlen=smoothing_window)
        self.current_possession: Optional[str] = None
        self.possession_frames = {LABEL_TEAM1: 0, LABEL_TEAM2: 0, "Contested": 0}
        self.total_frames = 0

    def update(self, detections: List[Detection], get_label_fn) -> Optional[str]:
        self.total_frames += 1

        ball_det = None
        players = []
        for det in detections:
            if det.cls == BALL_CLS:
                ball_det = det
            elif det.cls == PERSON_CLS:
                players.append(det)

        ball_pos = self._update_ball_position(ball_det)

        if ball_pos is None or len(players) == 0:
            self.possession_frames["Contested"] += 1
            return self.current_possession

        min_dist = float("inf")
        closest_player = None

        for player in players:
            dist = np.sqrt(
                (player.center[0] - ball_pos[0]) ** 2 +
                (player.center[1] - ball_pos[1]) ** 2
            )
            if dist < min_dist:
                min_dist = dist
                closest_player = player

        if closest_player is None or min_dist > self.proximity_threshold:
            self.raw_possession_buffer.append(None)
            self.possession_frames["Contested"] += 1
            return self.current_possession

        if closest_player.track_id is not None:
            label = get_label_fn(closest_player.track_id)
        else:
            label = closest_player.label

        team = self._label_to_team(label)

        if team is None:
            self.raw_possession_buffer.append(None)
            self.possession_frames["Contested"] += 1
            return self.current_possession

        self.raw_possession_buffer.append(team)
        self.current_possession = self._smooth_possession()

        if self.current_possession in self.possession_frames:
            self.possession_frames[self.current_possession] += 1
        else:
            self.possession_frames["Contested"] += 1

        return self.current_possession

    def _update_ball_position(self, ball_det: Optional[Detection]) -> Optional[Tuple[float, float]]:
        if ball_det is not None:
            pos = ball_det.center
            self.last_valid_ball = pos
            self.missing_ball_count = 0
            self.ball_history.append(pos)
            return pos

        self.missing_ball_count += 1
        if self.missing_ball_count <= self.interpolation_limit and self.last_valid_ball is not None:
            self.ball_history.append(self.last_valid_ball)
            return self.last_valid_ball

        self.ball_history.append(None)
        return None

    def _label_to_team(self, label: str) -> Optional[str]:
        if label in (LABEL_TEAM1, LABEL_GK_TEAM1):
            return LABEL_TEAM1
        elif label in (LABEL_TEAM2, LABEL_GK_TEAM2):
            return LABEL_TEAM2
        else:
            return None

    def _smooth_possession(self) -> Optional[str]:
        if len(self.raw_possession_buffer) == 0:
            return None

        counts = {LABEL_TEAM1: 0, LABEL_TEAM2: 0}
        for item in self.raw_possession_buffer:
            if item in counts:
                counts[item] += 1

        if counts[LABEL_TEAM1] == 0 and counts[LABEL_TEAM2] == 0:
            return self.current_possession

        if counts[LABEL_TEAM1] >= counts[LABEL_TEAM2]:
            return LABEL_TEAM1
        else:
            return LABEL_TEAM2

    def get_ball_position(self) -> Optional[Tuple[float, float]]:
        if self.ball_history and self.ball_history[-1] is not None:
            return self.ball_history[-1]
        return self.last_valid_ball

    def get_stats(self) -> dict:
        team1 = self.possession_frames[LABEL_TEAM1]
        team2 = self.possession_frames[LABEL_TEAM2]
        total = team1 + team2

        if total == 0:
            pct1 = "50.0%"
            pct2 = "50.0%"
        else:
            pct1 = f"{(team1 / total) * 100:.1f}%"
            pct2 = f"{(team2 / total) * 100:.1f}%"

        return {
            "possession": {
                LABEL_TEAM1: pct1,
                LABEL_TEAM2: pct2,
            },
            "possession_frames": {
                LABEL_TEAM1: team1,
                LABEL_TEAM2: team2,
            },
        }
