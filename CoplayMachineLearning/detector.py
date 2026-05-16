import torch
from dataclasses import dataclass
from typing import List, Optional
from ultralytics import YOLO

PERSON_CLS = 0
BALL_CLS = 32


@dataclass
class Detection:
    track_id: Optional[int]
    cls: int
    bbox: tuple
    confidence: float
    center: tuple
    label: str = ""


class Detector:

    def __init__(self, model_path: str = "yolo11n.pt", conf: float = 0.3):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[Detector] Loading {model_path} on {self.device}...", flush=True)
        self.model = YOLO(model_path)
        self.conf = conf
        self.track_initialized = False

    def detect_image(self, frame) -> List[Detection]:
        results = self.model(frame, verbose=False, device=self.device, conf=self.conf)[0]
        return self._parse_results(results, tracked=False)

    def detect_and_track(self, frame) -> List[Detection]:
        results = self.model.track(
            frame,
            persist=True,
            verbose=False,
            device=self.device,
            conf=self.conf,
            tracker="bytetrack.yaml",
        )[0]
        self.track_initialized = True
        return self._parse_results(results, tracked=True)

    def _parse_results(self, results, tracked: bool) -> List[Detection]:
        detections = []

        boxes = results.boxes
        if boxes is None or len(boxes) == 0:
            return detections

        xyxy = boxes.xyxy.cpu().numpy()
        cls_arr = boxes.cls.cpu().numpy().astype(int)
        conf_arr = boxes.conf.cpu().numpy()

        if tracked and boxes.id is not None:
            ids = boxes.id.cpu().numpy().astype(int)
        else:
            ids = [None] * len(xyxy)

        for i in range(len(xyxy)):
            cls_id = cls_arr[i]
            if cls_id not in (PERSON_CLS, BALL_CLS):
                continue

            x1, y1, x2, y2 = xyxy[i]
            cx = (x1 + x2) / 2.0
            cy = (y1 + y2) / 2.0

            det = Detection(
                track_id=int(ids[i]) if ids[i] is not None else None,
                cls=cls_id,
                bbox=(float(x1), float(y1), float(x2), float(y2)),
                confidence=float(conf_arr[i]),
                center=(float(cx), float(cy)),
            )
            detections.append(det)

        return detections
