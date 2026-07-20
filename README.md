# MediVerse AI

**A Role-Based AI Healthcare Platform** — connecting Patients and Doctors on a
single, secure, and scalable platform.

> **Status: Phase 0 — Foundation Architecture**
> This repository currently contains only the production-grade project
> scaffolding. No business features, AI modules, dashboards, or
> authentication logic have been implemented yet. This phase exists solely
> to establish a clean, scalable foundation for all future phases.

---

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- React Router
- TanStack Query
- Axios
- React Hook Form + Zod
- Lucide Icons

### Backend
- FastAPI + Python
- SQLAlchemy + Alembic
- PostgreSQL
- Pydantic / Pydantic Settings
- JWT structure (Passlib + python-jose) — **not yet implemented**

### Infrastructure
- Docker + Docker Compose
- Environment-based configuration

---

## Architecture

The codebase follows **Feature-Based Architecture** with **Clean
Architecture** principles:

- **Repository Pattern** — all direct database access is isolated behind
  repositories (`backend/app/repositories`).
- **Service Layer Pattern** — business logic lives in services
  (`backend/app/services`), which orchestrate repositories. API routers
  never talk to repositories directly.
- **Dependency Injection** — FastAPI's `Depends` system is used throughout
  (e.g. `get_db`).
- **SOLID Principles** — generic base classes (`BaseRepository`,
  `BaseService`, `BaseModelMixin`) are extended, not modified, as new
  features are added.
- **Feature-based frontend structure** — each domain area
  (`features/auth`, `features/patient`, `features/doctor`) owns its pages,
  components, API calls, and types.

This structure is designed so that future phases (authentication, AI
modules, dashboards, appointments, medical timeline, etc.) can be added by
creating new files within the existing structure — **without major
refactors**.

---

## Project Structure

```
mediverse-ai/
├── frontend/                      # React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── app/                   # Root App component & router
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui primitives
│   │   │   ├── layout/             # Navbar, Sidebar, layouts
│   │   │   └── common/            # Loading, Error, ProtectedRoute
│   │   ├── features/
│   │   │   ├── auth/               # Login/Register pages, API, types
│   │   │   ├── patient/            # Patient dashboard placeholder
│   │   │   └── doctor/             # Doctor dashboard placeholder
│   │   ├── pages/                 # Landing, 404
│   │   ├── providers/             # Theme, Query, Auth context
│   │   ├── lib/                   # axios instance, utils
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── config/                 # env.ts
│   │   ├── constants/              # routes, storage keys
│   │   └── styles/                 # globals.css (design tokens)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
│
├── backend/                        # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── main.py                 # App factory & entry point
│   │   ├── core/                   # config.py, logging.py
│   │   ├── db/                     # base.py, session.py
│   │   ├── models/                 # SQLAlchemy models
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── api/v1/                 # Versioned routers & endpoints
│   │   ├── middleware/             # Request logging middleware
│   │   ├── services/                # Business logic (Service Layer)
│   │   ├── repositories/           # Data access (Repository Pattern)
│   │   ├── exceptions/             # Custom exceptions & handlers
│   │   ├── utils/
│   │   └── auth/                    # JWT structure (placeholders only)
│   ├── alembic/                    # Migration environment
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Installation

### Prerequisites
- Node.js 20+
- Python 3.12+
- PostgreSQL 16+ (or use Docker Compose)
- Docker & Docker Compose (optional, for containerized setup)

### 1. Clone & configure environment variables

```bash
git clone <repository-url> mediverse-ai
cd mediverse-ai

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

---

## Running the Application

### Option A — Run locally

**Backend** (from `backend/`, with the virtual environment activated):
```bash
uvicorn app.main:app --reload
```
API available at: `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

**Frontend** (from `frontend/`):
```bash
npm run dev
```
App available at: `http://localhost:5173`

### Option B — Run with Docker Compose

From the project root:
```bash
docker compose up --build
```

| Service  | URL                          |
|----------|-------------------------------|
| Frontend | http://localhost:3000         |
| Backend  | http://localhost:8000         |
| API Docs | http://localhost:8000/docs    |
| Database | localhost:5432                |

---

## Database Migrations (Alembic)

Once PostgreSQL is running and `backend/.env` is configured:

```bash
cd backend
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

---

## Verification Checklist

- [ ] `cd backend && pip install -r requirements.txt` completes with no errors
- [ ] `uvicorn app.main:app --reload` starts without errors
- [ ] `GET http://localhost:8000/api/v1/health` returns `{"status": "ok", ...}`
- [ ] `GET http://localhost:8000/docs` renders the Swagger UI
- [ ] `cd frontend && npm install` completes with no errors
- [ ] `npm run dev` starts the Vite dev server without errors
- [ ] `npm run build` completes successfully and produces `frontend/dist`
- [ ] Landing page renders at `http://localhost:5173`
- [ ] `/login` and `/register` pages render with working client-side validation
- [ ] Navigating to an unknown route renders the 404 page
- [ ] Dark/light theme toggle switches the UI theme
- [ ] `docker compose up --build` starts all three services successfully

---

## What This Phase Intentionally Does NOT Include

Per the Phase 0 scope, the following are **not implemented** — only the
architecture is prepared to support them in future phases:

- Authentication logic (login, registration, token issuance/validation)
- AI features or predictions
- Dashboards with real data
- Appointments, chat, report uploads, medical timeline
- Disease prediction models

---

## Roadmap (Future Phases)

1. **Phase 1** — Authentication & Authorization (JWT, password hashing, RBAC)
2. **Phase 2** — Patient module (profile, medical records, timeline)
3. **Phase 3** — Doctor module (patient management, consultations)
4. **Phase 4** — AI modules (predictions, chat, insights)
5. **Phase 5** — Appointments, notifications, reporting

---

## License

Proprietary — All rights reserved.
