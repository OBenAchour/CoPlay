import os


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "football-analytics-dev-key")
    DEBUG = os.environ.get("FLASK_DEBUG", "0") == "1"

    UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads")
    OUTPUT_DIR = os.environ.get("OUTPUT_DIR", "outputs")
    MAX_CONTENT_LENGTH = int(os.environ.get("MAX_FILE_SIZE_MB", "500")) * 1024 * 1024
    ALLOWED_EXTENSIONS = {"mp4", "avi", "mov", "mkv", "wmv"}

    MODEL_PATH = os.environ.get("MODEL_PATH", "yolo11n.pt")
    DETECTION_CONF = float(os.environ.get("DETECTION_CONF", "0.3"))
    INIT_FRAMES = int(os.environ.get("INIT_FRAMES", "60"))
    POSSESSION_THRESHOLD = float(os.environ.get("POSSESSION_THRESHOLD", "300.0"))

    MAX_CONCURRENT_JOBS = int(os.environ.get("MAX_CONCURRENT_JOBS", "2"))

    HOST = os.environ.get("HOST", "0.0.0.0")
    PORT = int(os.environ.get("PORT", "5000"))
