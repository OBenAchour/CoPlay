import os
import sys
import uuid
import json
import time
import logging
import tempfile
import urllib.request
from datetime import datetime, timezone

from flask import Flask, request, jsonify, send_file, make_response, Response
from flask_cors import CORS

from config import Config
from services.processing_manager import ProcessingManager, JobStatus
from services.video_service import VideoService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("api")


def create_app(config: Config = None) -> Flask:
    if config is None:
        config = Config()

    app = Flask(__name__)
    app.config.from_object(config)
    app.config["MAX_CONTENT_LENGTH"] = config.MAX_CONTENT_LENGTH

    CORS(app, resources={r"/*": {"origins": "*"}}, expose_headers=["Content-Range", "Accept-Ranges"])

    manager = ProcessingManager(max_concurrent=config.MAX_CONCURRENT_JOBS)
    video_service = VideoService(
        manager=manager,
        model_path=config.MODEL_PATH,
        conf=config.DETECTION_CONF,
        init_frames=config.INIT_FRAMES,
        possession_threshold=config.POSSESSION_THRESHOLD,
        uploads_dir=config.UPLOAD_DIR,
        outputs_dir=config.OUTPUT_DIR,
    )

    color_config = {"global": None}

    def allowed_file(filename: str) -> bool:
        return "." in filename and \
            filename.rsplit(".", 1)[1].lower() in config.ALLOWED_EXTENSIONS

    def error_response(message: str, status_code: int = 400):
        return jsonify({"error": message}), status_code

    def parse_color_value(val):
        if val is None:
            return None
        if isinstance(val, str):
            val = val.strip().lstrip("#")
            if len(val) == 6:
                r = int(val[0:2], 16)
                g = int(val[2:4], 16)
                b = int(val[4:6], 16)
                return [b, g, r]
        if isinstance(val, (list, tuple)) and len(val) == 3:
            return [int(v) for v in val]
        return None

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "service": "football-analytics-api",
            "version": "2.0.0",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "model": config.MODEL_PATH,
            "max_concurrent_jobs": config.MAX_CONCURRENT_JOBS,
        })

    @app.route("/analyze/video", methods=["POST"])
    def analyze_video():
        # Accept both 'video' and 'file' field names for compatibility
        if "video" in request.files:
            file = request.files["video"]
        elif "file" in request.files:
            file = request.files["file"]
        else:
            return error_response("No 'video' field in request. Send multipart/form-data with field name 'video'.")
        if file.filename == "" or file.filename is None:
            return error_response("Empty filename.")

        if not allowed_file(file.filename):
            return error_response(
                f"Unsupported format. Allowed: {', '.join(config.ALLOWED_EXTENSIONS)}"
            )

        team_1_label = request.form.get("team1", request.form.get("team_1", request.form.get("teamA", request.form.get("team1_name", "Team 1"))))
        team_2_label = request.form.get("team2", request.form.get("team_2", request.form.get("teamB", request.form.get("team2_name", "Team 2"))))
        logger.info(f"[analyze_video] Form data team names: {team_1_label} vs {team_2_label}")

        try:
            max_seconds = float(request.form.get("max_seconds", request.args.get("max_seconds", 0)))
            frame_skip = int(request.form.get("frame_skip", request.args.get("frame_skip", 1)))
        except (ValueError, TypeError):
            return error_response("Invalid max_seconds or frame_skip parameter.")

        if frame_skip < 1:
            frame_skip = 1

        jersey_colors = None
        team1_color_raw = request.form.get("team1_color", request.args.get("team1_color"))
        team2_color_raw = request.form.get("team2_color", request.args.get("team2_color"))
        gk_team1_color_raw = request.form.get("gk_team1_color", request.args.get("gk_team1_color"))
        gk_team2_color_raw = request.form.get("gk_team2_color", request.args.get("gk_team2_color"))

        if team1_color_raw or team2_color_raw:
            jersey_colors = {}
            t1 = parse_color_value(team1_color_raw)
            t2 = parse_color_value(team2_color_raw)
            if t1:
                jersey_colors["team1"] = t1
            if t2:
                jersey_colors["team2"] = t2
            gk1 = parse_color_value(gk_team1_color_raw)
            gk2 = parse_color_value(gk_team2_color_raw)
            if gk1:
                jersey_colors["gk_team1"] = gk1
            if gk2:
                jersey_colors["gk_team2"] = gk2

        json_body = request.get_json(silent=True)
        if json_body is None:
            try:
                import json as _json
                raw = request.form.get("jersey_colors")
                if raw:
                    json_body = _json.loads(raw)
            except Exception:
                pass

        if json_body and isinstance(json_body, dict):
            if "jersey_colors" in json_body:
                jc = json_body["jersey_colors"]
                jersey_colors = jersey_colors or {}
                for key in ("team1", "team2", "gk_team1", "gk_team2"):
                    parsed = parse_color_value(jc.get(key))
                    if parsed:
                        jersey_colors[key] = parsed

        if jersey_colors is None and color_config["global"] is not None:
            jersey_colors = color_config["global"]

        if not manager.can_accept_job():
            return error_response(
                "Server at maximum capacity. Please wait and retry.",
                status_code=503,
            )

        temp_job_id = str(uuid.uuid4())[:8]
        upload_path = video_service.get_upload_path(file.filename, temp_job_id)
        file.save(upload_path)
        file_size_mb = os.path.getsize(upload_path) / (1024 * 1024)
        logger.info(f"Uploaded: {file.filename} ({file_size_mb:.1f} MB)")
        team_1_label = request.form.get("team_1", request.form.get("team1_name", "Team 1"))
        team_2_label = request.form.get("team_2", request.form.get("team2_name", "Team 2"))
        logger.info(f"[analyze_video] Received team names: {team_1_label} vs {team_2_label}")

        try:
            result = video_service.submit_job(
                video_path=upload_path,
                max_seconds=max_seconds,
                frame_skip=frame_skip,
                jersey_colors=jersey_colors,
                team1_name=team_1_label,
                team2_name=team_2_label,
            )
            result["team_1"] = team_1_label
            result["team_2"] = team_2_label
            return jsonify(result), 202
        except RuntimeError as e:
            return error_response(str(e), status_code=503)

    @app.route("/analyze/json", methods=["POST"])
    def analyze_json():
        data = request.get_json(silent=True)
        if data is None:
            return error_response("Request body must be valid JSON with Content-Type: application/json.")

        video_url = data.get("video_url")
        video_path = data.get("video_path")

        if not video_url and not video_path:
            return error_response("Either 'video_url' or 'video_path' is required.")

        max_seconds = float(data.get("max_seconds", 0))
        frame_skip = int(data.get("frame_skip", 1))
        if frame_skip < 1:
            frame_skip = 1

        jersey_colors = None
        team1_color_raw = data.get("team1_color")
        team2_color_raw = data.get("team2_color")
        gk_team1_color_raw = data.get("gk_team1_color")
        gk_team2_color_raw = data.get("gk_team2_color")

        if team1_color_raw or team2_color_raw:
            jersey_colors = {}
            t1 = parse_color_value(team1_color_raw)
            t2 = parse_color_value(team2_color_raw)
            if t1:
                jersey_colors["team1"] = t1
            if t2:
                jersey_colors["team2"] = t2
            gk1 = parse_color_value(gk_team1_color_raw)
            gk2 = parse_color_value(gk_team2_color_raw)
            if gk1:
                jersey_colors["gk_team1"] = gk1
            if gk2:
                jersey_colors["gk_team2"] = gk2

        if data.get("jersey_colors") and isinstance(data["jersey_colors"], dict):
            jersey_colors = jersey_colors or {}
            for key in ("team1", "team2", "gk_team1", "gk_team2"):
                parsed = parse_color_value(data["jersey_colors"].get(key))
                if parsed:
                    jersey_colors[key] = parsed

        if jersey_colors is None and color_config["global"] is not None:
            jersey_colors = color_config["global"]

        if not manager.can_accept_job():
            return error_response(
                "Server at maximum capacity. Please wait and retry.",
                status_code=503,
            )

        temp_job_id = str(uuid.uuid4())[:8]
        upload_path = None

        try:
            if video_url:
                ext = os.path.splitext(video_url.split("?")[0])[1] or ".mp4"
                upload_path = os.path.join(config.UPLOAD_DIR, f"{temp_job_id}_download{ext}")
                logger.info(f"Downloading video from URL: {video_url}")
                urllib.request.urlretrieve(video_url, upload_path)
            elif video_path:
                if not os.path.exists(video_path):
                    return error_response(f"Video file not found: {video_path}", status_code=404)
                upload_path = video_path

            file_size_mb = os.path.getsize(upload_path) / (1024 * 1024)
            logger.info(f"Video ready: {upload_path} ({file_size_mb:.1f} MB)")

            team1_name = data.get("team1", data.get("team_1", data.get("teamA", data.get("team1_name", "Team 1"))))
            team2_name = data.get("team2", data.get("team_2", data.get("teamB", data.get("team2_name", "Team 2"))))
            logger.info(f"[analyze_json] JSON team names: {team1_name} vs {team2_name}")

            result = video_service.submit_job(
                video_path=upload_path,
                max_seconds=max_seconds,
                frame_skip=frame_skip,
                jersey_colors=jersey_colors,
                team1_name=team1_name,
                team2_name=team2_name,
            )
            return jsonify(result), 202
        except RuntimeError as e:
            return error_response(str(e), status_code=503)
        except Exception as e:
            logger.exception("Failed to process JSON request")
            return error_response(f"Failed to process request: {str(e)}", status_code=500)

    @app.route("/analyze", methods=["POST"])
    def analyze():
        data = request.get_json(silent=True)
        if data is None:
            return error_response("Request body must be valid JSON with Content-Type: application/json.")

        video_input = data.get("video")
        if not video_input:
            return error_response("'video' field is required. Provide a file path or URL to the video.")

        team1_color_raw = data.get("team1_color")
        team2_color_raw = data.get("team2_color")
        gk_team1_color_raw = data.get("gk_team1_color")
        gk_team2_color_raw = data.get("gk_team2_color")

        if not team1_color_raw or not team2_color_raw:
            return error_response("'team1_color' and 'team2_color' are required.")

        max_seconds = float(data.get("max_seconds", 0))
        frame_skip = int(data.get("frame_skip", 1))
        if frame_skip < 1:
            frame_skip = 1

        jersey_colors = {}
        t1 = parse_color_value(team1_color_raw)
        t2 = parse_color_value(team2_color_raw)
        if t1:
            jersey_colors["team1"] = t1
        if t2:
            jersey_colors["team2"] = t2
        gk1 = parse_color_value(gk_team1_color_raw)
        gk2 = parse_color_value(gk_team2_color_raw)
        if gk1:
            jersey_colors["gk_team1"] = gk1
        if gk2:
            jersey_colors["gk_team2"] = gk2

        if not jersey_colors.get("team1") or not jersey_colors.get("team2"):
            return error_response("Invalid color values. Use hex (e.g. 'FF0000') or BGR array (e.g. [0,0,255]).")

        temp_job_id = str(uuid.uuid4())[:8]
        upload_path = None

        try:
            is_url = video_input.startswith("http://") or video_input.startswith("https://")

            if is_url:
                ext = os.path.splitext(video_input.split("?")[0])[1] or ".mp4"
                upload_path = os.path.join(config.UPLOAD_DIR, f"{temp_job_id}_download{ext}")
                logger.info(f"Downloading video from URL: {video_input}")
                urllib.request.urlretrieve(video_input, upload_path)
            else:
                if not os.path.exists(video_input):
                    return error_response(f"Video file not found: {video_input}", status_code=404)
                upload_path = video_input

            file_size_mb = os.path.getsize(upload_path) / (1024 * 1024)
            logger.info(f"Video ready: {upload_path} ({file_size_mb:.1f} MB)")

            job_output_dir = os.path.join(config.OUTPUT_DIR, temp_job_id)
            os.makedirs(job_output_dir, exist_ok=True)

            from analytics import FootballAnalytics

            start_time = time.time()

            team1_name = data.get("team1", data.get("team_1", data.get("teamA", data.get("team1_name", "Team 1"))))
            team2_name = data.get("team2", data.get("team_2", data.get("teamB", data.get("team2_name", "Team 2"))))
            logger.info(f"[analyze] JSON team names: {team1_name} vs {team2_name}")

            pipeline = FootballAnalytics(
                model_path=config.MODEL_PATH,
                conf=config.DETECTION_CONF,
                init_frames=config.INIT_FRAMES,
                possession_threshold=config.POSSESSION_THRESHOLD,
                output_dir=job_output_dir,
                jersey_colors=jersey_colors,
                team1_name=team1_name,
                team2_name=team2_name,
            )

            result = pipeline.process_video(
                video_path=upload_path,
                max_seconds=max_seconds,
                frame_skip=frame_skip,
            )

            processing_time = round(time.time() - start_time, 2)

            summary = {
                "status": "completed",
                "processing_time_seconds": processing_time,
                "video": result["stats"].get("video", {}),
                "detections": result["stats"].get("detections", {}),
                "output_video": result["output_path"],
                "input": {
                    "video": video_input,
                    "team1_color": team1_color_raw,
                    "team2_color": team2_color_raw,
                    "gk_team1_color": gk_team1_color_raw,
                    "gk_team2_color": gk_team2_color_raw,
                    "max_seconds": max_seconds,
                    "frame_skip": frame_skip,
                },
            }
            return jsonify(summary), 200

        except Exception as e:
            logger.exception("Processing failed")
            return error_response(f"Processing failed: {str(e)}", status_code=500)

    @app.route("/analyze/sync", methods=["POST"])
    def analyze_sync():
        data = request.get_json(silent=True)
        if data is None:
            return error_response("Request body must be valid JSON with Content-Type: application/json.")

        video_url = data.get("video_url")
        video_path = data.get("video_path")

        if not video_url and not video_path:
            return error_response("Either 'video_url' or 'video_path' is required.")

        max_seconds = float(data.get("max_seconds", 30))
        frame_skip = int(data.get("frame_skip", 2))
        if frame_skip < 1:
            frame_skip = 1

        jersey_colors = None
        team1_color_raw = data.get("team1_color")
        team2_color_raw = data.get("team2_color")
        gk_team1_color_raw = data.get("gk_team1_color")
        gk_team2_color_raw = data.get("gk_team2_color")

        if team1_color_raw or team2_color_raw:
            jersey_colors = {}
            t1 = parse_color_value(team1_color_raw)
            t2 = parse_color_value(team2_color_raw)
            if t1:
                jersey_colors["team1"] = t1
            if t2:
                jersey_colors["team2"] = t2
            gk1 = parse_color_value(gk_team1_color_raw)
            gk2 = parse_color_value(gk_team2_color_raw)
            if gk1:
                jersey_colors["gk_team1"] = gk1
            if gk2:
                jersey_colors["gk_team2"] = gk2

        if data.get("jersey_colors") and isinstance(data["jersey_colors"], dict):
            jersey_colors = jersey_colors or {}
            for key in ("team1", "team2", "gk_team1", "gk_team2"):
                parsed = parse_color_value(data["jersey_colors"].get(key))
                if parsed:
                    jersey_colors[key] = parsed

        if jersey_colors is None and color_config["global"] is not None:
            jersey_colors = color_config["global"]

        temp_job_id = str(uuid.uuid4())[:8]
        upload_path = None

        try:
            if video_url:
                ext = os.path.splitext(video_url.split("?")[0])[1] or ".mp4"
                upload_path = os.path.join(config.UPLOAD_DIR, f"{temp_job_id}_download{ext}")
                logger.info(f"[sync] Downloading video from URL: {video_url}")
                urllib.request.urlretrieve(video_url, upload_path)
            elif video_path:
                if not os.path.exists(video_path):
                    return error_response(f"Video file not found: {video_path}", status_code=404)
                upload_path = video_path

            job_output_dir = os.path.join(config.OUTPUT_DIR, temp_job_id)
            os.makedirs(job_output_dir, exist_ok=True)

            from analytics import FootballAnalytics

            team1_name = data.get("team1", data.get("team_1", data.get("teamA", data.get("team1_name", "Team 1"))))
            team2_name = data.get("team2", data.get("team_2", data.get("teamB", data.get("team2_name", "Team 2"))))
            logger.info(f"[analyze_sync] JSON team names: {team1_name} vs {team2_name}")

            pipeline = FootballAnalytics(
                model_path=config.MODEL_PATH,
                conf=config.DETECTION_CONF,
                init_frames=config.INIT_FRAMES,
                possession_threshold=config.POSSESSION_THRESHOLD,
                output_dir=job_output_dir,
                jersey_colors=jersey_colors,
                team1_name=team1_name,
                team2_name=team2_name,
            )

            result = pipeline.process_video(
                video_path=upload_path,
                max_seconds=max_seconds,
                frame_skip=frame_skip,
            )

            summary = {
                "status": "completed",
                "video": result["stats"].get("video", {}),
                "detections": result["stats"].get("detections", {}),
                "output_video": result["output_path"],
                "input": {
                    "video_url": video_url,
                    "video_path": video_path,
                    "max_seconds": max_seconds,
                    "frame_skip": frame_skip,
                    "jersey_colors": {
                        "team1_color": team1_color_raw,
                        "team2_color": team2_color_raw,
                        "gk_team1_color": gk_team1_color_raw,
                        "gk_team2_color": gk_team2_color_raw,
                    },
                },
            }
            return jsonify(summary), 200

        except Exception as e:
            logger.exception("[sync] Processing failed")
            return error_response(f"Processing failed: {str(e)}", status_code=500)

    @app.route("/analyze/status/<job_id>", methods=["GET"])
    def job_status(job_id):
        job = manager.get_job(job_id)
        if job is None:
            return error_response(f"Job not found: {job_id}", status_code=404)
        return jsonify(job.to_dict())

    @app.route("/analyze/result/<job_id>", methods=["GET"])
    def job_result(job_id):
        job = manager.get_job(job_id)
        if job is None:
            return error_response(f"Job not found: {job_id}", status_code=404)

        if job.status == JobStatus.FAILED:
            return jsonify({
                "job_id": job_id,
                "status": "failed",
                "error": job.error,
            }), 422

        if job.status != JobStatus.COMPLETED:
            return jsonify({
                "job_id": job_id,
                "status": job.status.value,
                "progress": round(job.progress, 4),
                "message": "Job is still processing. Check /analyze/status/<job_id> for progress.",
            }), 200

        response = dict(job.result) if job.result else {}
        response["job_id"] = job_id
        response["status"] = "completed"
        response["output_video_url"] = f"/download/{job_id}"
        if job.completed_at and job.created_at:
            response["processing_time_seconds"] = round(job.completed_at - job.created_at, 1)
        return jsonify(response)

    @app.route("/download/<job_id>", methods=["GET"])
    def stream_video(job_id):
        job = manager.get_job(job_id)
        if job is None:
            return error_response(f"Job not found: {job_id}", status_code=404)

        if job.status != JobStatus.COMPLETED:
            return error_response(
                f"Job not yet completed. Status: {job.status.value}",
                status_code=409,
            )

        video_path = video_service.get_output_video(job_id)

        if video_path is None or not os.path.exists(video_path):
            return error_response("Output video not found.", status_code=404)

        # Use send_file with conditional=True
        # This automatically handles 'Range' requests and 'Accept-Ranges: bytes'
        return send_file(
            video_path,
            mimetype="video/mp4",
            as_attachment=False,
            conditional=True
        )
    @app.route("/config/colors", methods=["POST"])
    def set_colors():
        data = request.get_json(silent=True)
        if data is None:
            return error_response("Request body must be JSON.")

        if "team1" not in data or "team2" not in data:
            return error_response("At minimum, 'team1' and 'team2' color values are required.")

        parsed = {}
        for key in ("team1", "team2", "gk_team1", "gk_team2"):
            val = parse_color_value(data.get(key))
            if val:
                parsed[key] = val

        color_config["global"] = parsed
        logger.info(f"Color config updated: {color_config['global']}")
        return jsonify({
            "message": "Color configuration saved.",
            "config": color_config["global"],
        })

    @app.route("/config/colors", methods=["GET"])
    def get_colors():
        return jsonify({
            "config": color_config["global"],
            "message": "No custom colors set. Using auto-detection." if color_config["global"] is None else "Custom colors active.",
        })

    @app.route("/jobs", methods=["GET"])
    def list_jobs():
        limit = request.args.get("limit", 50, type=int)
        jobs = manager.list_jobs(limit=limit)
        return jsonify({"jobs": jobs, "count": len(jobs)})

    @app.errorhandler(413)
    def file_too_large(e):
        max_mb = config.MAX_CONTENT_LENGTH // (1024 * 1024)
        return jsonify({"error": f"File too large. Maximum size: {max_mb} MB"}), 413

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found."}), 404

    @app.errorhandler(500)
    def internal_error(e):
        logger.exception("Internal server error")
        return jsonify({"error": "Internal server error."}), 500

    return app


app = create_app()

if __name__ == "__main__":
    cfg = Config()
    print(f"""
Football Analytics API v2.2.0
=============================
POST  /analyze             JSON body analyze (primary endpoint)
POST  /analyze/video       Upload & analyze (multipart/form-data)
POST  /analyze/json        JSON body analyze (async, returns job_id)
POST  /analyze/sync        JSON body analyze (sync, returns results)
GET   /analyze/status/id   Check progress
GET   /analyze/result/id   Get results
GET   /download/id         Download video
POST  /config/colors       Set jersey colors globally
GET   /config/colors       Get current color config
GET   /jobs                List all jobs
GET   /health              Health check

Model: {cfg.MODEL_PATH}
Max concurrent jobs: {cfg.MAX_CONCURRENT_JOBS}
Max upload size: {cfg.MAX_CONTENT_LENGTH // (1024*1024)} MB
""")
    app.run(host=cfg.HOST, port=cfg.PORT, debug=cfg.DEBUG)
