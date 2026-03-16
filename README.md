# Operations Management Platform

Enterprise platform for digitalizing internal operations — built with **FastAPI**, **React**, **PostgreSQL**, and **Docker**.

![Stack](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Stack](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react)
![Stack](https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql)
![Stack](https://img.shields.io/badge/Infra-Docker-2496ED?style=flat-square&logo=docker)

---

## Features

| Feature | Description |
|---------|-------------|
| **Request Management** | Create, track, and manage operational requests |
| **Status Workflow** | `OPEN` → `IN_PROGRESS` → `RESOLVED` → `CLOSED` |
| **Full Audit Trail** | Every create, update, and delete is logged with timestamp and detail |
| **Executive Dashboard** | Real-time KPIs across all request statuses |
| **REST API** | Complete Swagger/OpenAPI documentation at `/docs` |
| **Dockerized** | One command to spin up the full stack |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI 0.111 · Python 3.11 |
| Database | PostgreSQL 16 |
| ORM | SQLAlchemy 2.0 + Pydantic v2 |
| Frontend | React 18 · Vite 5 |
| Styling | Tailwind CSS 3 |
| HTTP Client | Axios |
| Infrastructure | Docker · Docker Compose |

---

## Quick Start

### Docker (recommended)

```bash
git clone <repo-url>
cd operations-management-platform
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

### Local Development

**Backend**

```bash
cd backend
pip install -r requirements.txt
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/operations \
  uvicorn main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

> The Vite dev server proxies all `/requests`, `/audit`, and `/health` calls to `http://localhost:8000` automatically.

---

## Project Structure

```
operations-management-platform/
├── backend/
│   ├── main.py                 # App entry point, CORS, DB init
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── api/
│   │   ├── request_routes.py   # CRUD endpoints for requests
│   │   └── audit_routes.py     # Audit log read endpoint
│   ├── models/
│   │   ├── database.py         # SQLAlchemy engine + session
│   │   ├── request.py          # Request ORM model
│   │   └── audit_log.py        # AuditLog ORM model
│   ├── schemas/
│   │   ├── request.py          # Pydantic request/response schemas
│   │   └── audit.py            # Pydantic audit schema
│   └── services/
│       ├── request_service.py  # Business logic + validation
│       └── audit_service.py    # Audit logging helper
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js          # Dev proxy to backend
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── src/
│       ├── App.jsx             # Tab navigation shell
│       ├── api.js              # Axios instance
│       ├── pages/
│       │   ├── Dashboard.jsx   # KPI cards + recent requests table
│       │   ├── Requests.jsx    # Full CRUD + inline status update
│       │   └── AuditLog.jsx    # Immutable audit trail
│       └── components/
│           └── RequestForm.jsx # Controlled form with validation
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## API Reference

### Requests

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/requests` | Create a request |
| `GET` | `/requests` | List all requests (newest first) |
| `GET` | `/requests/{id}` | Get a single request |
| `PUT` | `/requests/{id}` | Update request status |
| `DELETE` | `/requests/{id}` | Delete a request |

**Valid statuses:** `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`

### Audit

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/audit` | List audit log entries (`?limit=100`) |

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check |

---

## Business Use Case

Built for enterprises that need to **digitalize internal operations**:

- Operational request management
- Internal ticket and issue tracking
- Workflow digitalization with audit compliance
- Executive reporting and process control

---

## Architecture

```
Browser
  │
  ├── GET /requests ──► Vite Dev Server ──► FastAPI ──► PostgreSQL
  ├── POST /requests         (proxy)
  └── GET /audit
```

In production Docker, the Vite proxy routes API calls from the browser (via the container) directly to the `backend` service using Docker's internal DNS.
