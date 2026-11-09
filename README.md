# CoPlay — Sports Management Platform with AI Video Analytics

CoPlay is a full-stack platform for managing sports teams, competitions and
events, with a built-in **computer-vision service** that analyzes match videos
(player detection, possession, analytics) using YOLO. It combines a web
application, a REST/WebSocket backend, and a Python machine-learning service,
all containerized and monitored.

## Architecture

```
   ┌──────────────────┐        REST + WebSocket        ┌───────────────────────┐
   │  CoplayFrontend  │  ───────────────────────────►  │     Coplaybackend     │
   │     (Angular)    │  ◄───────────────────────────  │  Spring Boot (:8080)  │
   └──────────────────┘        JWT-secured API         │  MongoDB · WebSocket  │
            │                                           │  Mail · springdoc     │
            │ video upload / analytics                  └──────────┬────────────┘
            ▼                                                      │ actuator
   ┌───────────────────────────┐                                  ▼
   │   CoplayMachineLearning   │                            ┌────────────┐
   │   Flask + YOLO (OpenCV,   │                            │ Prometheus │
   │   PyTorch, ultralytics)   │                            └────────────┘
   └───────────────────────────┘

                  Orchestrated with docker-compose
```

## Components

| Component | Tech | Role |
| --- | --- | --- |
| `CoplayFrontend` | Angular, TypeScript | Web user interface |
| `Coplaybackend` | Spring Boot, MongoDB, Spring Security (JWT), WebSocket, Mail | REST/real-time API, auth, business logic |
| `CoplayMachineLearning` | Python, Flask, YOLO (ultralytics), OpenCV, PyTorch | Match-video analysis (detection, possession, analytics) |
| `docker-compose.yml` | Docker Compose | Runs all services together |
| `prometheus.yml` | Prometheus | Scrapes backend metrics (Actuator) |

## Features

Team management · competitions · events · a marketplace · real-time messaging
(WebSocket) · and AI-driven match-video analytics.

## Tech stack

**Frontend:** Angular · TypeScript
**Backend:** Java · Spring Boot · Spring Security + JWT · Spring Data MongoDB ·
WebSocket · Spring Mail · springdoc-openapi · Actuator
**ML service:** Python · Flask · Ultralytics YOLO · OpenCV · PyTorch
**Infra:** Docker · Docker Compose · Prometheus

## Run (Docker Compose)

```bash
docker-compose up --build
```

Then open the frontend and the backend API (Swagger UI is served by the backend
on port `8080`). The YOLO model weights used by the ML service are expected
alongside `CoplayMachineLearning/` (see that folder's README).

## Running services individually

- **Backend:** `cd Coplaybackend && mvn spring-boot:run` (requires MongoDB)
- **Frontend:** `cd CoplayFrontend && npm install && ng serve`
- **ML service:** `cd CoplayMachineLearning && pip install -r requirements.txt && python app.py`

## Configuration

Service configuration (MongoDB URI, mail, JWT secret, ports) should be supplied
via environment variables / the compose file rather than committed. Do not commit
real secrets.
