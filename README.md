# VibeOpl-g

Platform til undervisere der deler vibe-codede projektidéer til programmeringsundervisning.

## Funktioner

- **Projektoversigt** med billeder, beskrivelser og vejledning
- **Præsentationstilstand** med forside, indholdsfortegnelse og sektioner
- **Kommentarer** på projekter (kræver adgangskode)
- **Bidragsprofiler** (navn, skole, mail) gemt lokalt i browseren
- **Discord-link** konfigureres via miljøvariabel
- **Fælles adgangskode** for oprettelse, redigering og kommentering
- **Billedupload** via MinIO (S3-kompatibel objektlagring)

## Tech stack

- Backend: FastAPI, SQLAlchemy, PostgreSQL, Alembic
- Frontend: React, TypeScript, Vite
- Lagring: MinIO (Docker) eller lokal disk (`STORAGE_BACKEND=local`)
- Deployment: Docker Compose

## Kom i gang

### 1. Klon og konfigurer

```bash
git clone <repo-url>
cd VibeOpl-g
cp .env.example .env
```

Rediger `.env` og sæt mindst:

- `APP_ACCESS_PASSWORD` — adgangskode til redigering (deles med teamet)
- `DISCORD_URL` — link til jeres Discord-server
- `SECRET_KEY` — lang tilfældig streng til session-cookies

**Commit aldrig `.env` til git.**

### 2. Start med Docker

```bash
docker compose up --build
```

Åbn [http://localhost](http://localhost) i browseren.

**MinIO-konsol** (billeder): [http://localhost:9001](http://localhost:9001) — login med `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` fra `.env`.

### 3. Lokal udvikling (valgfrit)

Sæt `STORAGE_BACKEND=local` i `.env` hvis du kører backend uden MinIO. Med Docker bruges MinIO automatisk.

**Backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# Sæt DATABASE_URL til lokal PostgreSQL
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Frontend kører på [http://localhost:5173](http://localhost:5173) med API-proxy til port 8000.

## Adgang

Alle undervisere bruger samme adgangskode (sat i `APP_ACCESS_PASSWORD`). Kodeordet vises ikke i koden eller dokumentationen — kun i jeres `.env`.

Efter login kan I:

- Oprette og redigere projekter
- Uploade billeder
- Skrive kommentarer

## Agent-team

Se [AGENTS.md](AGENTS.md) for orkestrering af de 6 Cursor-agenter der varetager udviklingen.

## Mappestruktur

```
backend/     FastAPI API
frontend/    React SPA
docker-compose.yml
.env.example
AGENTS.md
.cursor/skills/   Agent-roller
```
