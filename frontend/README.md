# LegalBaby Frontend Redesign (Next.js)

This folder contains the redesigned premium UI for LegalBaby v4.

## What Was Changed
- Full frontend redesign only (Next.js + Tailwind + shadcn-style primitives + framer-motion)
- Existing backend logic/APIs/scheduling/report generation remain untouched
- New UI consumes the same existing endpoints:
  - `/api/daily`
  - `/api/weekly`
  - `/api/dates`
  - `/api/status`
  - `/api/run/daily`
  - `/api/run/weekly`
  - `/api/reset-baseline`

## Run Locally
1. Install deps
   - `cd frontend`
   - `npm install`
2. Ensure backend is running on port 3000
   - From repo root: `node index-v4.js --schedule`
3. Start frontend
   - `npm run dev`
4. Open `http://localhost:3010`

## Environment
Copy `.env.example` to `.env.local` and adjust if needed.

- `NEXT_PUBLIC_API_BASE_URL`
  - local backend default: `http://localhost:3000`

## Deploy Strategy (Recommended)
- Keep current root deployment for backend/API and scheduler workflows.
- Deploy this `frontend/` folder as a separate Vercel project.

### Vercel Wiring (Frontend as Primary Domain)
1. Backend project (existing root project):
  - Keep deploying from repo root.
  - This remains your API domain.

2. Frontend project (new Vercel project):
  - Import same repo.
  - Set **Root Directory** to `frontend`.
  - Framework preset: Next.js.

3. In frontend project Environment Variables, choose ONE approach:
  - Approach A (direct browser calls):
    - `NEXT_PUBLIC_API_BASE_URL=https://<your-backend-domain>`
  - Approach B (recommended, same-origin API paths):
    - `LEGALBABY_API_BASE_URL=https://<your-backend-domain>`
    - leave `NEXT_PUBLIC_API_BASE_URL` empty or unset

4. Deploy frontend project and attach your main/custom domain there.
5. Keep backend on its own Vercel domain.

With approach B, frontend requests `/api/*` and Next rewrites to backend automatically.

## Key UI Areas
- Sticky top nav with status and timestamp
- Hero glass panel with metric chips
- Daily and Weekly bento-like report grids
- Report detail side drawer with actions (ADD/MOVE/REMOVE)
- Skeleton loading states and motion transitions

## Notes
- This redesign avoids backend/file-structure changes by design.
- If the dashboard appears empty, verify backend data availability and API base URL.
