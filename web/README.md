# AthsVic Insights (Next.js)

Full stack Next.js app. The `/api/*` routes match the old Django API.

## Run locally

```bash
cd web
# If npm SSL fails on Windows, use:
# set NODE_OPTIONS=--use-system-ca
npm install
npm run dev
```

Open http://localhost:3000

The full UI from `frontend/` now lives here (Calendar, Venues, Athletes, sidebar, dark mode).

API examples:

- GET /api/health
- GET /api/events?season=2026
- GET /api/athletes
- GET /api/athletes/results?name=Last,First

## Env

Copy `.env.example` to `.env.local` if you need to turn off SSL verify on Windows.

## Django

The Python API in `/api` is kept for local reference only. The browser should call this Next app, not Django.

## Cache

Athletes list and season events are cached in memory for 10 minutes to speed up repeat loads.
