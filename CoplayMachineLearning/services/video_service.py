import os
import sys
import threading
import logging
import shutil
from typing import Optional, Dict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from analytics import FootballAnalytics
from services.processing_manager import ProcessingManager, JobStatus

logger = logging.getLogger(__name__)


class VideoService:

    def __init__(
        self,
        manager: ProcessingManager,
        model_path: str = "yolo11n.pt",
        conf: float = 0.3,
        init_frames: int = 60,
        possession_threshold: float = 300.0,
        uploads_dir: str = "uploads",
        outputs_dir: str = "outputs",
    ):
        self.manager = manager
        self.model_path = model_path
        self.conf = conf
        self.init_frames = init_frames
        self.possession_threshold = possession_threshold
        self.uploads_dir = uploads_dir
        self.outputs_dir = outputs_dir

        os.makedirs(uploads_dir, exist_ok=True)
        os.makedirs(outputs_dir, exist_ok=True)

    def submit_job(
        self,
        video_path: str,
        max_seconds: float = 0,
        frame_skip: int = 1,
        jersey_colors: Optional[Dict] = None,
        team1_name: str = "Team 1",
        team2_name: str = "Team 2",
    ) -> dict:
        if not self.manager.can_accept_job():
            raise RuntimeError("Server is at maximum processing capacity. Try again later.")

        params = {
            "max_seconds": max_seconds,
            "frame_skip": frame_skip,
            "model": self.model_path,
            "jersey_colors": jersey_colors,
        }
        job = self.manager.create_job(input_path=video_path, params=params)

        job_output_dir = os.path.join(self.outputs_dir, job.job_id)
        os.makedirs(job_output_dir, exist_ok=True)

        thread = threading.Thread(
            target=self._process_job,
            args=(job.job_id, video_path, job_output_dir, max_seconds, frame_skip, jersey_colors, team1_name, team2_name),
            daemon=True,
            name=f"job-{job.job_id[:8]}",
        )
        thread.start()

        logger.info(f"Job {job.job_id} submitted, thread started")
        return {"job_id": job.job_id, "status": "processing"}

    def _process_job(
        self,
        job_id: str,
        video_path: str,
        output_dir: str,
        max_seconds: float,
        frame_skip: int,
        jersey_colors: Optional[Dict] = None,
        team1_name: str = "Team 1",
        team2_name: str = "Team 2",
    ):
        self.manager.update_status(job_id, JobStatus.PROCESSING)

        try:
            pipeline = FootballAnalytics(
                model_path=self.model_path,
                conf=self.conf,
                init_frames=self.init_frames,
                possession_threshold=self.possession_threshold,
                output_dir=output_dir,
                jersey_colors=jersey_colors,
                team1_name=team1_name,
                team2_name=team2_name,
            )

            def on_progress(frame_idx: int, total_frames: int):
                self.manager.update_progress(job_id, frame_idx, total_frames)

            result = pipeline.process_video(
                video_path=video_path,
                max_seconds=max_seconds,
                frame_skip=frame_skip,
                progress_callback=on_progress,
            )

            output_path = result["output_path"]
            stats = result["stats"]

            self.manager.set_result(job_id, stats, output_path)
            logger.info(f"Job {job_id} completed: {output_path}")

        except Exception as e:
            logger.exception(f"Job {job_id} failed")
            self.manager.set_error(job_id, str(e))

    def get_upload_path(self, filename: str, job_id: str) -> str:
        safe_name = "".join(c for c in filename if c.isalnum() or c in "._-")
        if not safe_name:
            safe_name = "video.mp4"
        return os.path.join(self.uploads_dir, f"{job_id}_{safe_name}")

    def get_output_video(self, job_id: str) -> Optional[str]:
        job = self.manager.get_job(job_id)
        if job and job.output_path and os.path.exists(job.output_path):
            return job.output_path
        return None
