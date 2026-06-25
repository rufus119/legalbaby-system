# FINAL AUDIT

Date: 2026-06-25
Scope: Full repository audit for production freeze stabilization.

## KEEP

- Core runtime and automation:
  - `index-v4.js`
  - `config.js`
  - `api/index.js`
  - `lib/appleMusicFetcher.js`
  - `lib/dashboardServer.js`
  - `lib/intelligenceEngine.js`
  - `lib/monitoringEngine.js`
  - `lib/reportGenerator.js`
  - `lib/scheduler.js`
  - `lib/snapshotManager.js`
  - `.github/workflows/daily-monitoring.yml`
  - `.github/workflows/weekly-analysis.yml`
- Production frontend routes and active UI:
  - `frontend/app/dashboard/page.tsx`
  - `frontend/app/charts/page.tsx`
  - `frontend/app/genres/page.tsx`
  - `frontend/app/timeline/page.tsx`
  - `frontend/app/search/page.tsx`
  - `frontend/app/settings/page.tsx`
  - `frontend/app/compare/page.tsx`
  - `frontend/components/dashboard/dashboard-shell.tsx`
  - `frontend/components/dashboard/top-nav.tsx`
  - `frontend/components/dashboard/hero-panel.tsx`
  - `frontend/components/dashboard/report-grid.tsx`
  - `frontend/components/dashboard/report-card.tsx`
  - `frontend/components/dashboard/detail-drawer.tsx`
  - `frontend/components/layout/page-container.tsx`
  - `frontend/components/layout/bottom-nav.tsx`
  - `frontend/components/ui/*`
  - `frontend/lib/api.ts`
  - `frontend/lib/dashboard-helpers.ts`
  - `frontend/lib/types.ts`
  - `frontend/lib/utils.ts`
  - `frontend/lib/insights-engine.ts`
  - `frontend/lib/future-ready.ts`
  - `frontend/app/globals.css`
  - `frontend/tailwind.config.ts`
- Data and deployment configuration:
  - `data/reports/**`
  - `data/snapshots/**`
  - `vercel.json`
  - `frontend/vercel.json`
  - root and frontend `package.json`/lockfiles

## REMOVE (safe)

Candidate dead/legacy frontend code not referenced by active app routes:

- `frontend/components/dashboard/dashboard-experience.tsx`
- `frontend/components/dashboard/daily-section.tsx`
- `frontend/components/dashboard/weekly-section.tsx`
- `frontend/components/dashboard/hero-section.tsx`
- `frontend/components/dashboard/loading-shell.tsx`
- `frontend/components/dashboard/report-detail-modal.tsx`
- `frontend/components/layout/floating-navbar.tsx`
- `frontend/components/layout/background-ambience.tsx`
- `frontend/components/providers/theme-provider.tsx`
- `frontend/components/animations/animation-provider.tsx`
- `frontend/components/animations/count-up.tsx`
- `frontend/components/cards/daily-playlist-card.tsx`
- `frontend/components/cards/weekly-genre-card.tsx`
- `frontend/components/charts/hero-wave-chart.tsx`

Reason: these files are only referenced by other legacy files and not by current route entrypoints.

## ARCHIVE

Archive non-runtime reports and historical process docs (retain for traceability, remove from root clutter):

- `AUDIT_DIAGNOSTIC.md`
- `AUDIT_FIXES_SUMMARY.md`
- `AUDIT_PHASE1.md`
- `AUTOMATION_REPORT.md`
- `CLEANUP_REPORT.md`
- `DASHBOARD_REPORT.md`
- `DIAGNOSTIC_REPORT.md`
- `IMPLEMENTATION_SUMMARY.md`
- `NEXT_STEPS.md`
- `PRODUCTIONIZATION_COMPLETE.md`
- `SYSTEM_AUDIT.md`
- `CLAUDE_AI_PROMPT.md`

Keep docs:

- `README-V4.md`
- `QUICK_START.md`
- `FINAL_SETUP_GUIDE.md`

## INVESTIGATE

- Workflow risk: `.github/workflows/playlist-update.yml`
  - Scheduled at same cron as daily monitoring, causing duplicate midnight execution risk.
  - Uses `node index.js --now`, but repository entrypoint is `index-v4.js` (no `index.js` file in root).
  - Requires Spotify secrets not used by current Apple Music monitoring architecture.
- `data.json`
  - Not referenced by active code path; unclear if needed for manual operations.
- Root `test` script
  - Currently placeholder and always fails (`echo "Error: no test specified" && exit 1`).

## Audit Notes

- No dead route files found in active Next.js `app` route tree.
- Current mobile corrections introduced recently are valid and should be preserved.
- No destructive deletion should occur without archive fallback where uncertainty exists.
