# ⚽ Football Players Matching — Analytics API

Real-time football video analytics with player detection, team classification, goalkeeper identification, ball tracking, and possession statistics.

---

## Quick Start

### 1. Install Dependencies

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Run the API Server

```bash
# Development
python app.py

# Production
gunicorn app:app --bind 0.0.0.0:5000 --workers 1 --threads 4 --timeout 300
```

Server starts at `http://0.0.0.0:5000`

### 3. Docker

```bash
docker build -t football-analytics .
docker run -p 5000:5000 football-analytics
```

---

## Primary Endpoint: `POST /analyze`

The main API endpoint. Send a **JSON body** with the video input and jersey colors, and receive a full match analytics summary JSON.

### Request

**Method:** `POST`
**URL:** `http://localhost:5000/analyze`
**Content-Type:** `application/json`

### JSON Payload

```json
{
  "video": "/path/to/match.mp4",
  "team1_color": "FF0000",
  "gk_team1_color": "00FF00",
  "team2_color": "0000FF",
  "gk_team2_color": "FFFF00",
  "max_seconds": 60,
  "frame_skip": 2
}
```

### Payload Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `video` | string | **yes** | — | Path to video file on server, or HTTP/HTTPS URL to download |
| `team1_color` | string or array | **yes** | — | Team 1 jersey color (hex string or BGR array) |
| `team2_color` | string or array | **yes** | — | Team 2 jersey color (hex string or BGR array) |
| `gk_team1_color` | string or array | no | auto-detect | Goalkeeper team 1 jersey color |
| `gk_team2_color` | string or array | no | auto-detect | Goalkeeper team 2 jersey color |
| `max_seconds` | float | no | `0` (full video) | Max seconds of video to process. `0` = entire video |
| `frame_skip` | int | no | `1` | Process every Nth frame. Higher = faster but less accurate |

### Color Format

Colors can be provided in any of these formats:

| Format | Example | Description |
|--------|---------|-------------|
| Hex string | `"FF0000"` | RGB hex without `#` prefix |
| Hex with # | `"#FF0000"` | RGB hex with `#` prefix |
| BGR array | `[0, 0, 255]` | OpenCV BGR integer array |

### Common Colors Reference

| Color | Hex Code | Description |
|-------|----------|-------------|
| 🔴 Red | `FF0000` | Common home jersey |
| 🔵 Blue | `0000FF` | Common away jersey |
| ⚪ White | `FFFFFF` | Common away jersey |
| 🟢 Green | `00FF00` | Common goalkeeper |
| 🟡 Yellow | `FFFF00` | Common goalkeeper |
| ⚫ Black | `000000` | Referee / alternate |
| 🟠 Orange | `FFA500` | Alternate jersey |

---

## curl Examples

### Full request with all colors

```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "video": "/path/to/match.mp4",
    "team1_color": "FF0000",
    "gk_team1_color": "00FF00",
    "team2_color": "0000FF",
    "gk_team2_color": "FFFF00",
    "max_seconds": 60,
    "frame_skip": 2
  }'
```

### With video URL

```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "video": "https://example.com/match.mp4",
    "team1_color": "FF0000",
    "team2_color": "FFFFFF"
  }'
```

### Minimal required fields

```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "video": "/data/videos/match.mp4",
    "team1_color": "FF0000",
    "team2_color": "0000FF"
  }'
```

### Using BGR arrays

```bash
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "video": "/data/videos/match.mp4",
    "team1_color": [0, 0, 255],
    "team2_color": [255, 0, 0],
    "gk_team1_color": [0, 255, 0],
    "gk_team2_color": [0, 255, 255]
  }'
```

---

## Response: Summary JSON

**Status:** `200 OK`

```json
{
  "status": "completed",
  "processing_time_seconds": 45.23,
  "video": {
    "total_frames": 750,
    "possession": {
      "Team 1": "54.3%",
      "Team 2": "45.7%"
    },
    "possession_frames": {
      "Team 1": 312,
      "Team 2": 263
    },
    "goalkeeper_frames": {
      "Team 1": 89,
      "Team 2": 102
    },
    "referee_frames": 45
  },
  "detections": {
    "players": {
      "Team 1": 11,
      "Team 2": 11
    }
  },
  "output_video": "/path/to/outputs/abc123/output_match.mp4",
  "input": {
    "video": "/path/to/match.mp4",
    "team1_color": "FF0000",
    "team2_color": "0000FF",
    "gk_team1_color": "00FF00",
    "gk_team2_color": "FFFF00",
    "max_seconds": 60,
    "frame_skip": 2
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Always `"completed"` on success |
| `processing_time_seconds` | float | Time taken to process the video in seconds |
| `video.total_frames` | int | Total number of frames processed |
| `video.possession.Team 1` | string | Ball possession percentage for team 1 |
| `video.possession.Team 2` | string | Ball possession percentage for team 2 |
| `video.possession_frames.Team 1` | int | Number of frames team 1 had possession |
| `video.possession_frames.Team 2` | int | Number of frames team 2 had possession |
| `video.goalkeeper_frames.Team 1` | int | Frames where team 1 goalkeeper was detected |
| `video.goalkeeper_frames.Team 2` | int | Frames where team 2 goalkeeper was detected |
| `video.referee_frames` | int | Frames where referee was detected |
| `detections.players.Team 1` | int | Unique player IDs detected for team 1 |
| `detections.players.Team 2` | int | Unique player IDs detected for team 2 |
| `output_video` | string | Path to the annotated output video file |
| `input` | object | Echo of the input parameters used |

---

## Error Responses

All errors return JSON:

```json
{
  "error": "Description of what went wrong"
}
```

### Error Examples

**Missing required field:**
```json
{
  "error": "'video' field is required. Provide a file path or URL to the video."
}
```

**Missing team colors:**
```json
{
  "error": "'team1_color' and 'team2_color' are required."
}
```

**Invalid color values:**
```json
{
  "error": "Invalid color values. Use hex (e.g. 'FF0000') or BGR array (e.g. [0,0,255])."
}
```

**Video not found:**
```json
{
  "error": "Video file not found: /path/to/nonexistent.mp4"
}
```

### HTTP Status Codes

| Status Code | Meaning |
|-------------|---------|
| `200` | Success — summary JSON returned |
| `400` | Bad request (missing fields, invalid format) |
| `404` | Video file not found |
| `413` | File too large |
| `500` | Internal server error |

---

## All API Endpoints

| Method | Endpoint | Content-Type | Description |
|--------|----------|-------------|-------------|
| `POST` | `/analyze` | `application/json` | **Primary** — JSON input, returns summary |
| `POST` | `/analyze/video` | `multipart/form-data` | Upload video file (async) |
| `POST` | `/analyze/json` | `application/json` | Video via URL/path (async) |
| `POST` | `/analyze/sync` | `application/json` | Video via URL/path (sync) |
| `GET` | `/analyze/status/<job_id>` | — | Check job progress |
| `GET` | `/analyze/result/<job_id>` | — | Get full analysis results |
| `GET` | `/download/<job_id>` | — | Download annotated video |
| `POST` | `/config/colors` | `application/json` | Set global jersey colors |
| `GET` | `/config/colors` | — | Get current color config |
| `GET` | `/jobs` | — | List all jobs |
| `GET` | `/health` | — | Health check |

---

## `POST /analyze/video` — Multipart File Upload (Async)

Upload a video file directly with optional jersey color hints as form fields.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | yes | Video file (mp4, avi, mov, mkv, wmv) |
| `team1_color` | string | no | Team 1 jersey color as hex |
| `team2_color` | string | no | Team 2 jersey color as hex |
| `gk_team1_color` | string | no | Goalkeeper team 1 color |
| `gk_team2_color` | string | no | Goalkeeper team 2 color |
| `max_seconds` | float | no | Max seconds to process |
| `frame_skip` | int | no | Process every Nth frame |

```bash
curl -X POST http://localhost:5000/analyze/video \
  -F "file=@match.mp4" \
  -F "team1_color=FF0000" \
  -F "team2_color=FFFFFF" \
  -F "gk_team1_color=00FF00" \
  -F "gk_team2_color=FFFF00"
```

**Response (202 Accepted):**
```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "processing"
}
```

---

## `POST /analyze/json` — JSON Video Analysis (Async)

Submit a video via URL or path. Processing runs in the background.

```json
{
  "video_url": "https://example.com/match.mp4",
  "team1_color": "FF0000",
  "team2_color": "0000FF",
  "gk_team1_color": "00FF00",
  "gk_team2_color": "FFFF00",
  "max_seconds": 60,
  "frame_skip": 2
}
```

**Response (202 Accepted):**
```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "processing"
}
```

Then poll for results:
```bash
curl http://localhost:5000/analyze/status/<job_id>
curl http://localhost:5000/analyze/result/<job_id>
```

---

## `GET /analyze/status/<job_id>`

```bash
curl http://localhost:5000/analyze/status/<job_id>
```

```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "processing",
  "progress": 0.4523,
  "created_at": 1714524000.0
}
```

---

## `GET /analyze/result/<job_id>`

```bash
curl http://localhost:5000/analyze/result/<job_id>
```

```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "completed",
  "output_video_url": "/download/a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "processing_time_seconds": 45.2,
  "video": {
    "total_frames": 750,
    "possession": {
      "Team 1": "54.3%",
      "Team 2": "45.7%"
    },
    "possession_frames": {
      "Team 1": 312,
      "Team 2": 263
    },
    "goalkeeper_frames": {
      "Team 1": 89,
      "Team 2": 102
    },
    "referee_frames": 45
  },
  "detections": {
    "players": {
      "Team 1": 11,
      "Team 2": 11
    }
  }
}
```

---

## `POST /config/colors` — Set Global Colors

Set jersey colors that apply to all future jobs unless overridden per-job.

```bash
curl -X POST http://localhost:5000/config/colors \
  -H "Content-Type: application/json" \
  -d '{"team1": "FF0000", "team2": "FFFFFF", "gk_team1": "00FF00", "gk_team2": "FFFF00"}'
```

---

## `GET /health`

```bash
curl http://localhost:5000/health
```

```json
{
  "status": "healthy",
  "service": "football-analytics-api",
  "version": "2.0.0",
  "timestamp": "2026-05-01T00:00:00Z",
  "model": "yolo11n.pt",
  "max_concurrent_jobs": 2
}
```

---

## CLI Usage

```bash
python main.py --input data/video.mp4
python main.py --input data/video.mp4 --team1-color FF0000 --team2-color 0000FF
python main.py --input data/video.mp4 --max-seconds 30 --model yolo11x.pt
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MODEL_PATH` | `yolo11n.pt` | YOLO model file |
| `DETECTION_CONF` | `0.3` | Detection confidence threshold |
| `INIT_FRAMES` | `60` | Frames for auto team classification |
| `POSSESSION_THRESHOLD` | `300.0` | Max pixel distance for ball possession |
| `MAX_CONCURRENT_JOBS` | `2` | Max parallel analysis jobs |
| `MAX_FILE_SIZE_MB` | `500` | Max upload size in MB |
| `UPLOAD_DIR` | `uploads` | Upload storage directory |
| `OUTPUT_DIR` | `outputs` | Output storage directory |
| `HOST` | `0.0.0.0` | Server bind address |
| `PORT` | `5000` | Server port |

---

## Project Structure

```
players-matching/
├── app.py                    Flask API server
├── main.py                   CLI entry point
├── config.py                 Configuration
├── detector.py               YOLO detection + ByteTrack tracking
├── classifier.py             Team/GK/Referee classification (KMeans)
├── possession.py             Ball possession engine
├── analytics.py              Main orchestrator + visualization
├── services/
│   ├── processing_manager.py Thread-safe job registry
│   └── video_service.py      Background video processing
├── requirements.txt          Python dependencies
├── Dockerfile                Docker container
└── README.md                 This file
```
