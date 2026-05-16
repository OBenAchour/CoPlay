import threading
import uuid
import time
import json
import os
import logging
from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Job:
    job_id: str
    status: JobStatus = JobStatus.QUEUED
    progress: float = 0.0
    result: Optional[Dict[str, Any]] = None
    output_path: Optional[str] = None
    input_path: Optional[str] = None
    error: Optional[str] = None
    created_at: float = field(default_factory=time.time)
    completed_at: Optional[float] = None
    params: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict:
        d = {
            "job_id": self.job_id,
            "status": self.status.value,
            "progress": round(self.progress, 4),
            "created_at": self.created_at,
            "params": self.params,
            "output_path": self.output_path,
        }
        if self.result:
            d["result"] = self.result
        if self.error:
            d["error"] = self.error
        if self.completed_at:
            d["completed_at"] = self.completed_at
            d["processing_time_seconds"] = round(self.completed_at - self.created_at, 1)
        return d

    @classmethod
    def from_dict(cls, d: dict) -> 'Job':
        return cls(
            job_id=d["job_id"],
            status=JobStatus(d["status"]),
            progress=d.get("progress", 0.0),
            result=d.get("result"),
            output_path=d.get("output_path"),
            input_path=d.get("input_path"),
            error=d.get("error"),
            created_at=d.get("created_at", time.time()),
            completed_at=d.get("completed_at"),
            params=d.get("params", {}),
        )


class ProcessingManager:

    def __init__(self, max_concurrent: int = 2, storage_path: str = "jobs.json"):
        self._jobs: Dict[str, Job] = {}
        self._lock = threading.Lock()
        self._max_concurrent = max_concurrent
        self._active_count = 0
        self._storage_path = storage_path
        self._load_jobs()

    def _save_jobs(self):
        try:
            with self._lock:
                data = {jid: job.to_dict() for jid, job in self._jobs.items()}
            with open(self._storage_path, "w") as f:
                json.dump(data, f, indent=4)
        except Exception as e:
            logger.error(f"Failed to save jobs to {self._storage_path}: {e}")

    def _load_jobs(self):
        if not os.path.exists(self._storage_path):
            return
        try:
            with open(self._storage_path, "r") as f:
                data = json.load(f)
            with self._lock:
                for jid, d in data.items():
                    self._jobs[jid] = Job.from_dict(d)
            logger.info(f"Loaded {len(self._jobs)} jobs from {self._storage_path}")
        except Exception as e:
            logger.error(f"Failed to load jobs from {self._storage_path}: {e}")

    def create_job(self, input_path: str, params: dict) -> Job:
        job_id = str(uuid.uuid4())
        job = Job(
            job_id=job_id,
            input_path=input_path,
            params=params,
        )
        with self._lock:
            self._jobs[job_id] = job
        self._save_jobs()
        logger.info(f"Job created: {job_id}")
        return job

    def get_job(self, job_id: str) -> Optional[Job]:
        with self._lock:
            return self._jobs.get(job_id)

    def update_status(self, job_id: str, status: JobStatus):
        with self._lock:
            job = self._jobs.get(job_id)
            if job:
                job.status = status
                if status == JobStatus.PROCESSING:
                    self._active_count += 1
                elif status in (JobStatus.COMPLETED, JobStatus.FAILED):
                    self._active_count = max(0, self._active_count - 1)
                    job.completed_at = time.time()
        self._save_jobs()

    def update_progress(self, job_id: str, frame_idx: int, total_frames: int):
        with self._lock:
            job = self._jobs.get(job_id)
            if job and total_frames > 0:
                job.progress = min(frame_idx / total_frames, 1.0)
        # We don't save on every progress update to avoid overhead

    def set_result(self, job_id: str, result: dict, output_path: str):
        with self._lock:
            job = self._jobs.get(job_id)
            if job:
                job.result = result
                job.output_path = output_path
                job.status = JobStatus.COMPLETED
                job.progress = 1.0
                job.completed_at = time.time()
                self._active_count = max(0, self._active_count - 1)
        self._save_jobs()
        logger.info(f"Job completed: {job_id}")

    def set_error(self, job_id: str, error: str):
        with self._lock:
            job = self._jobs.get(job_id)
            if job:
                job.status = JobStatus.FAILED
                job.error = error
                job.completed_at = time.time()
                self._active_count = max(0, self._active_count - 1)
        self._save_jobs()
        logger.error(f"Job failed: {job_id} — {error}")

    def can_accept_job(self) -> bool:
        with self._lock:
            return self._active_count < self._max_concurrent

    def list_jobs(self, limit: int = 50) -> list:
        with self._lock:
            jobs = sorted(
                self._jobs.values(),
                key=lambda j: j.created_at,
                reverse=True,
            )
            return [j.to_dict() for j in jobs[:limit]]

    def cleanup_old_jobs(self, max_age_seconds: int = 3600):
        cutoff = time.time() - max_age_seconds
        with self._lock:
            stale = [
                jid for jid, job in self._jobs.items()
                if job.created_at < cutoff and job.status in (JobStatus.COMPLETED, JobStatus.FAILED)
            ]
            for jid in stale:
                del self._jobs[jid]
        if stale:
            self._save_jobs()
            logger.info(f"Cleaned up {len(stale)} old jobs")
