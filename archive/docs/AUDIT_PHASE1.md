# LEGALBABY V4 - COMPREHENSIVE SYSTEM AUDIT

**Date**: June 1, 2026  
**Audit Time**: System Analysis Phase 1

---

## 📊 DEPENDENCY GRAPH ANALYSIS

### V4 REQUIRED MODULES (KEEP)
```
index-v4.js
├── lib/scheduler.js (node-schedule)
├── lib/dashboardServer.js
│   ├── lib/snapshotManager.js
│   ├── lib/reportGenerator.js (fs, path)
│   └── config.js
├── lib/monitoringEngine.js
│   ├── lib/appleMusicFetcher.js (playwright)
│   ├── lib/snapshotManager.js
│   ├── lib/intelligenceEngine.js
│   ├── lib/reportGenerator.js
│   └── config.js
└── config.js
```

### SPOTIFY AUTOMATION MODULES (DELETE)
```
orchestrator.js
├── spotifyManager.js (spotify-web-api-node)
│   └── searchQueue.js
├── dataTracker.js
├── playlistSnapshots.js
├── selectionStrategy.js
├── gradualPlaylistUpdater.js (requires playlistSnapshots.js)
├── gradualUpdateEngine.js
└── descriptionOptimizer.js
```

---

## 🗑️ FILES TO DELETE

### Legacy Spotify Automation (Core)
- `lib/spotifyManager.js` - Spotify API wrapper (NOT USED IN V4)
- `lib/orchestrator.js` - Old orchestration (NOT USED IN V4)
- `lib/descriptionOptimizer.js` - Description editor (NOT USED IN V4)
- `lib/searchQueue.js` - Search automation (NOT USED IN V4)
- `lib/selectionStrategy.js` - Song selection algorithm (NOT USED IN V4)
- `lib/gradualPlaylistUpdater.js` - Gradual playlist updater (NOT USED IN V4)
- `lib/gradualUpdateEngine.js` - Gradual update engine (NOT USED IN V4)
- `lib/dataTracker.js` - Old data tracking (NOT USED IN V4)
- `lib/playlistSnapshots.js` - Legacy snapshots (REPLACED BY snapshotManager.js)
- `lib/songMemory.js` - Legacy song memory (NOT USED IN V4)

### Legacy JSON Data Files
- `lib/failedSearches.json` - Spotify search debugging
- `lib/searchQueue.json` - Spotify search queue state
- `lib/songMemory.json` - Spotify song memory
- `lib/playlistData.json` - Spotify playlist data
- `lib/playlistSnapshots.json` - Legacy snapshots

---

## ✅ FILES TO RETAIN

### Core V4 System
- `lib/appleMusicFetcher.js` - Chart scraping (REQUIRED)
- `lib/snapshotManager.js` - Local database (REQUIRED)
- `lib/intelligenceEngine.js` - Change detection (REQUIRED)
- `lib/reportGenerator.js` - Report formatting (REQUIRED)
- `lib/monitoringEngine.js` - Daily/weekly orchestration (REQUIRED)
- `lib/scheduler.js` - Automation scheduling (REQUIRED)
- `lib/dashboardServer.js` - Web interface (REQUIRED)

### Configuration & Entry Points
- `index-v4.js` - Main entry point (REQUIRED)
- `config.js` - Playlist configuration (REQUIRED)
- `package.json` - Dependencies (UPDATE NEEDED)

### Data Directories
- `data/snapshots/daily/` - Daily snapshots (REQUIRED)
- `data/snapshots/weekly/` - Weekly snapshots (REQUIRED)
- `data/reports/daily/` - Daily reports (REQUIRED)
- `data/reports/weekly/` - Weekly reports (REQUIRED)

### Documentation
- `README-V4.md` - User documentation (REQUIRED)
- `IMPLEMENTATION_SUMMARY.md` - Technical details (REQUIRED)
- `.github/workflows/daily-monitoring.yml` - GitHub Actions daily (REQUIRED)
- `.github/workflows/weekly-analysis.yml` - GitHub Actions weekly (REQUIRED)

---

## 🔴 DEPENDENCY ISSUES

### Spotify Dependency (MUST REMOVE)
- `spotify-web-api-node` v5.0.2 in package.json
- Only used by deprecated `spotifyManager.js`
- Not imported in V4 system
- Can be safely removed

### Other Dependencies
- `axios` - Not directly used in V4 modules (Check if needed)
- `cheerio` - Not directly used in V4 modules (Check if needed)
- `puppeteer` - Not directly used (Playwright preferred)

---

## 📋 VERIFICATION CHECKLIST

- [ ] Delete all 10 Spotify automation modules
- [ ] Delete all 5 legacy JSON files
- [ ] Update package.json (remove spotify-web-api-node)
- [ ] Verify V4 modules still work after deletion
- [ ] Verify no import errors in remaining system
- [ ] Confirm dashboard starts
- [ ] Confirm daily monitoring runs
- [ ] Confirm weekly monitoring runs
- [ ] Verify GitHub Actions workflows are valid
- [ ] Create final audit report

---

**Next Step**: Execute cleanup and verify system integrity
