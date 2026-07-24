# Troubleshooting Guide

Common problems you'll hit running MediVerse AI locally on Windows, and
exactly how to fix each one. Written from real issues encountered during
development - read the "How to tell it's this problem" section first to
diagnose quickly instead of guessing.

---

## Quick diagnostic checklist

Before digging into a specific section below, run these three checks in
order. They cover ~90% of "nothing works" situations.

```powershell
# 1. Is something already running on your ports?
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# 2. Is Postgres actually reachable?
# (only meaningful if you're running the backend outside Docker)
Get-Service *postgres*

# 3. Do you have TWO copies of the app running at once?
# (e.g. one via Docker Desktop, one via uvicorn/npm manually)
docker ps
```

---

## Problem: Login/Register shows "Unable to reach the server"

### How to tell it's this problem
Browser shows a generic connection error. Open DevTools (F12) → Network
tab → click the failed request → check the **Status** column.

### If Status shows a real HTTP code (e.g. 500, 401, 403)
The backend IS reachable and responded - this isn't a connectivity
problem. Read the backend terminal for the actual error (see "Database
connection refused" or other sections below).

### If Status shows `(failed) net::ERR_EMPTY_RESPONSE`
The connection reached a server process, but it closed without sending
any response. This means **multiple processes are fighting over the same
port** (see "Port conflicts" below).

### If Status shows `(failed) net::ERR_CONNECTION_REFUSED`
Nothing is listening on that port at all. Your backend probably isn't
running, or `frontend/.env`'s `VITE_API_BASE_URL` points to the wrong
port.

---

## Problem: Port conflicts / ghost processes

### How to tell it's this problem
- `ERR_EMPTY_RESPONSE` in the browser (see above)
- Backend terminal shows **no log line at all** when you submit a
  request from the frontend (compare: a working request always logs
  `→ POST /api/v1/...` immediately)

### Step 1 - Find what's using the port
```powershell
netstat -ano | findstr :8000
```
Note the PID (last column) of every line.

### Step 2 - Kill each one
```powershell
taskkill /PID <PID> /F
```

### Step 3 - Verify it's actually clear
```powershell
netstat -ano | findstr :8000
```
Should return nothing.

### If `taskkill` says "process not found" but `netstat` still shows it
This is a stale/ghost socket entry the OS hasn't cleaned up - not a real
process. `taskkill` can't fix this. **Fastest workaround:** just run the
backend on a different port instead of fighting it.

```powershell
uvicorn app.main:app --reload --port 8001
```
Then update `frontend/.env`:

VITE_API_BASE_URL=http://localhost:8001/api/v1

**Restart the frontend dev server** after editing `.env` - Vite only
reads it at startup, a browser refresh is not enough.

If the ghost socket keeps coming back on every port you try, restart
your computer - this reliably clears phantom OS-level port reservations
(commonly caused by Hyper-V/WSL2, which Docker Desktop uses).

### Golden rule to prevent this
Always stop `uvicorn`/`npm run dev` with `Ctrl+C` and **wait for the
prompt to return** before closing the terminal window. Closing a
terminal tab directly (without Ctrl+C first) is what leaves orphaned
processes holding the port on Windows.

---

## Problem: Two copies of the app running at once (Docker + manual)

### How to tell it's this problem
```powershell
docker ps
```
If you see containers like `mediverse-backend`, `mediverse-frontend`,
`mediverse-db` **already running**, while you're ALSO running
`uvicorn`/`npm run dev` manually in a terminal - you have two full
copies of the app fighting over the same ports. This causes
unpredictable behavior: sometimes you hit the Docker copy (old code, no
`--reload`), sometimes your manual one, with no visible pattern.

### Fix - pick ONE way to run the app, not both

**Option A: Run everything via Docker (simplest, but no live-reload for editing code)**
```powershell
docker compose up --build
```
Don't run `uvicorn`/`npm run dev` manually at the same time.

**Option B: Run manually for development (recommended while actively coding)**
Stop the Docker containers for the app (keep the database one if you
don't have Postgres installed natively):
```powershell
docker stop mediverse-backend mediverse-frontend
```
Then run backend and frontend manually in separate terminals as usual.
If you kept `mediverse-db` (the Postgres container) running, make sure
`backend/.env` has `POSTGRES_HOST=localhost` (not `db` - `db` only
resolves inside Docker's own network).

---

## Problem: Database connection refused

### How to tell it's this problem
Backend terminal shows:
psycopg2.OperationalError: connection to server at "localhost" ...
port 5432 failed: Connection refused

### Step 1 - Check if you even have Postgres available
```powershell
Get-Service *postgres*
```

**If this returns nothing:** you don't have Postgres installed natively
on Windows. Your only database is likely the one inside Docker. Start
it:
```powershell
cd D:\path\to\project
docker compose up db
```

**If it shows a service that's `Stopped`:**
```powershell
net start <exact-service-name-shown-above>
```
(run PowerShell as Administrator if this fails)

### Step 2 - Confirm `backend/.env` points to the right host
- Running the backend **manually** (uvicorn directly) →
  `POSTGRES_HOST=localhost`
- Running the backend **inside Docker Compose** →
  `POSTGRES_HOST=db` (the Compose service name)

These are two different valid configs for two different run modes - not
a bug, just don't mix them up.

---

## Problem: AI Symptom Checker shows "Rule-based fallback" instead of "Trained ML model"

### How to tell it's this problem
The result card in the Symptom Checker UI shows a badge reading
**"Rule-based fallback"** instead of **"Trained ML model"**.

### Cause
The trained model files aren't present in `backend/app/ai/model/`. The
backend fails to load them silently (by design, so the app doesn't
crash) and falls back to the simpler rule-based engine instead.

### Fix
```powershell
cd <project-root>
dir backend\app\ai\model
```
If this folder is missing or empty, you haven't run the training
pipeline yet, or haven't copied the output over. Do both:

```powershell
cd ml
python download_data.py
python train_model.py
cd ..
mkdir backend\app\ai\model -Force
copy ml\model_output\disease_model.joblib backend\app\ai\model\ -Force
copy ml\model_output\disease_metadata.json backend\app\ai\model\ -Force
copy ml\model_output\symptom_list.json backend\app\ai\model\ -Force
dir backend\app\ai\model
```
The last command should list exactly 3 files. Then **restart the
backend** (the model only loads once, at process startup):
```powershell
cd backend
uvicorn app.main:app --reload --port 8001
```
Retry a symptom check - the badge should now say "Trained ML model".

---

## Problem: `source .venv/bin/activate` doesn't work

### How to tell it's this problem
source : The term 'source' is not recognized...

### Cause
`source` is a bash/Linux command. You're on Windows PowerShell.

### Fix
```powershell
.venv\Scripts\Activate.ps1
```
If PowerShell blocks this with a script-execution error, run once:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Still stuck?

When asking for help, always include:
1. The **exact command** you ran
2. The **full terminal output** (not a summary/paraphrase)
3. A screenshot of the actual error in the browser, if relevant
4. Output of `netstat -ano | findstr :8000` and `docker ps`

These four things are what actually let a debugging session move fast
instead of guessing.