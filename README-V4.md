# LegalBaby v4 - Playlist Intelligence Dashboard

## Overview

**LegalBaby v4 is NO LONGER a Spotify automation bot.**

This is now a **personal playlist intelligence and chart monitoring system** that:
- Scrapes Apple Music charts and playlists automatically
- Detects changes, new entries, removals, and movements
- Generates human-readable actionable reports
- Maintains historical snapshots for trend analysis
- Displays recommendations on a lightweight dashboard
- Runs fully automated with zero manual intervention

The user then **manually applies changes to Spotify** based on the recommendations provided.

## Key Features

### 🎵 Daily Top 100 Monitoring
- Scrapes Top 100 charts from: Nigeria, Ghana, Global, USA, UK
- Detects daily changes
- Generates comparison reports
- Runs automatically at **12:00 AM UTC**

### 🎯 Weekly Genre Analysis
- Analyzes: Gospel, Afrobeats, Hip Hop, R&B, Amapiano, EDM
- Scrapes from 7-12 Apple Music sources per genre
- Intelligently ranks tracks by momentum, frequency, and position
- Generates weekly playlist maintenance instructions
- Runs automatically every **Saturday at 12:00 AM UTC**

### 📊 Intelligent Change Detection
The system detects:
- **New entries**: Tracks entering charts for the first time
- **Removals**: Tracks falling out of charts
- **Movements**: Position changes (up/down)
- **Momentum**: Tracks appearing repeatedly across sources
- **Stale tracks**: Tracks older than 2 days (for cleanup)

### 💾 Local Snapshot Memory
Maintains persistent database:
- `data/snapshots/daily/` - Daily chart snapshots (one per day)
- `data/snapshots/weekly/` - Weekly genre rankings (one per week)
- `data/reports/daily/` - Daily change reports
- `data/reports/weekly/` - Weekly analysis reports
- `data/history/` - Historical tracking data

### 🌐 Personal Dashboard
Web interface at `http://localhost:3000` showing:
- Daily Top 100 reports
- Weekly genre analysis
- Historical trends
- Change summaries
- Actionable instructions

## Architecture

```
LegalBaby v4
├── Scraper Engine (appleMusicFetcher.js)
│   └─ Playwright-based chart scraping
├── Snapshot Manager (snapshotManager.js)
│   └─ Local JSON database
├── Intelligence Engine (intelligenceEngine.js)
│   └─ Change detection & momentum analysis
├── Report Generator (reportGenerator.js)
│   └─ Human-readable output formatting
├── Monitoring Engine (monitoringEngine.js)
│   └─ Daily & weekly orchestration
├── Scheduler (scheduler.js)
│   └─ node-schedule for automation
└── Dashboard Server (dashboardServer.js)
    └─ Lightweight HTTP interface
```

## Installation

```bash
# Install dependencies
npm install

# No Spotify credentials needed!
# All configuration in config.js already set up
```

## Usage

### Run Now
```bash
# Run daily monitoring immediately
node index-v4.js --now

# Run weekly genre analysis
node index-v4.js --weekly
```

### Run with Scheduler
```bash
# Run with automatic scheduling (12 AM daily, Saturday 12 AM weekly)
node index-v4.js --schedule

# Dashboard will be available at http://localhost:3000
```

### Automated with GitHub Actions
Workflows in `.github/workflows/` handle:
- Daily Top 100 monitoring (12:00 AM UTC)
- Weekly genre analysis (Saturday 12:00 AM UTC)
- Auto-commit reports to repository

Just push to GitHub and let Actions run automatically.

### Deploy Dashboard on Vercel
This repo is Vercel-ready using:
- `vercel.json` rewrite to `api/index.js`
- `api/index.js` serverless handler backed by `lib/dashboardServer.js`

Important behavior in Vercel:
- Dashboard is **read-only** in cloud mode.
- `Run Daily`, `Run Weekly`, and `Reset` buttons are disabled in cloud mode.
- Data is refreshed by GitHub Actions commits, then Vercel redeploys automatically.

Quick setup:
1. Push this repository to GitHub (if not already pushed).
2. In Vercel, click **Add New Project** and import this repo.
3. Framework preset: **Other**.
4. Build Command: leave empty.
5. Output Directory: leave empty.
6. Deploy.

After deployment:
1. Open your `*.vercel.app` URL on phone.
2. Keep GitHub Actions enabled so data updates daily/weekly.
3. If you ever want a fresh clean baseline, run reset locally, commit updated `data/` files, then push.

## Report Examples

### Daily Top 100 Report
```
============================================================
TOP 100 NIGERIA
Date: 2026-06-01
============================================================

NEW ENTRIES (3)
  • Track A by Artist A at #14
  • Track B by Artist B at #39
  • Track C by Artist C at #57

POSITION CHANGES (8)
  • Track D → #3 (was #7)
  • Track E → #12 (was #19)

REMOVED (2)
  • Track F (dropped)
  • Track G (stale - 3 days old)

============================================================
```

### Weekly Genre Report
```
============================================================
AFROBEATS WEEKLY
Week: May 28, 2026
============================================================

HOT NEW SONGS (5)
  • Track X by Artist X at #6
  • Track Y by Artist Y at #18

POSITION ADJUSTMENTS (10)
  • Track Z → #4 (was #11)

SONGS TO REMOVE (3)
  • Track A (weak performance)
  • Track B (stale - 5 days old)

============================================================
```

## Data Structure

### Daily Snapshot
```json
{
  "playlistName": "Top 100 Nigeria",
  "timestamp": "2026-06-01T12:00:00.000Z",
  "trackCount": 100,
  "tracks": [...],
  "changes": {
    "added": [...],
    "removed": [...],
    "moved": [...]
  }
}
```

### Weekly Snapshot
```json
{
  "playlistName": "Gospel",
  "timestamp": "2026-06-01T12:00:00.000Z",
  "trackCount": 50,
  "tracks": [
    {
      "id": "track-id",
      "name": "Track Name",
      "artist": "Artist Name",
      "position": 1,
      "score": 87.5,
      "ranking": {
        "frequency": 50,
        "position": 100,
        "momentum": 25
      }
    }
  ],
  "changes": {...}
}
```

## How to Use Reports

1. **View Dashboard**: Open http://localhost:3000
2. **Browse Reports**: Click on any playlist to view changes
3. **Read Instructions**: Each report shows:
   - What to ADD (new hot songs)
   - What to REMOVE (stale/weak tracks)
   - What to MOVE (reorder tracks)
4. **Manual Updates**: Apply changes to Spotify manually
5. **Track Changes**: System saves next snapshot for comparison

## Comparison Example

### First Week (Initial Run)
```
Gospel Playlist Analysis
- Found: 50 new tracks
- Changes: +50 added, -0 removed, 0 moved
→ Action: Add all 50 tracks to Spotify
```

### Second Week
```
Gospel Playlist Analysis
- Previous snapshot available
- New scrape: 47 of last week's tracks still trending
- Found: 8 new hot tracks
- Lost: 3 stale tracks
- Movements: 5 tracks moved significantly
→ Action: Add 8 new, Remove 3 stale, Reorder 5
```

## Configuration

All playlists configured in `config.js`:
- **top100**: Nigerian, Ghanaian, Global, USA, UK charts
- **genres**: Gospel, Afrobeats, Hip Hop, R&B, Amapiano, EDM

Each playlist has:
- `spotifyId`: For future manual updates
- `trackingKey`: Unique identifier for snapshots
- `sources`: Apple Music source playlists

No Spotify API credentials needed.

## File Structure

```
legalbaby-system/
├── index-v4.js                    # Main entry point
├── config.js                      # Playlist configuration
├── package.json                   # Dependencies
├── lib/
│   ├── monitoringEngine.js        # Daily/weekly orchestration
│   ├── snapshotManager.js         # Snapshot database
│   ├── intelligenceEngine.js      # Change detection
│   ├── reportGenerator.js         # Report formatting
│   ├── scheduler.js               # Scheduling
│   ├── dashboardServer.js         # Web dashboard
│   ├── appleMusicFetcher.js       # Scraper (existing)
│   └── [other modules]
├── data/
│   ├── snapshots/
│   │   ├── daily/                 # Daily chart snapshots
│   │   └── weekly/                # Weekly genre snapshots
│   ├── reports/
│   │   ├── daily/                 # Daily change reports
│   │   └── weekly/                # Weekly analysis reports
│   └── history/                   # Historical data
├── .github/
│   └── workflows/
│       ├── daily-monitoring.yml   # Daily automation
│       └── weekly-analysis.yml    # Weekly automation
└── README.md                      # This file
```

## Scheduling

### Local Scheduling (node-schedule)
```bash
node index-v4.js --schedule
```
- Runs within your Node process
- Stops when process exits
- Good for development/testing

### GitHub Actions Scheduling
- Runs automatically in the cloud
- Recommended for production
- Workflows in `.github/workflows/`

### System Cron (Linux/Mac)
```bash
# Daily at midnight
0 0 * * * cd /path/to/legalbaby && node index-v4.js --now

# Weekly Saturday midnight
0 0 * * 6 cd /path/to/legalbaby && node index-v4.js --weekly
```

## Performance Notes

- Daily monitoring: ~2-3 minutes (5 playlists)
- Weekly analysis: ~8-10 minutes (6 genres × 7-12 sources)
- Dashboard startup: Instant
- Memory usage: ~200MB during operation
- Disk usage: ~2MB per day (snapshots + reports)

## Troubleshooting

### Dashboard not loading
```bash
# Check port availability
node index-v4.js --schedule
# Open http://localhost:3000
```

### No snapshots being created
```bash
# Check data directory permissions
ls -la data/
# Run manually to see errors
node index-v4.js --now
```

### Apple Music scraping failing
- Playwright browser initialization sometimes fails
- Check internet connection
- Clear Playwright cache: `npx playwright install`

## What Happened to Spotify Integration?

**Completely removed.**

The old v3 system tried to:
- ❌ Search Spotify API (rate limited, Forbidden errors)
- ❌ Modify playlists (permission issues)
- ❌ Update descriptions (not needed)
- ❌ Automate everything (overkill)

The new v4 system:
- ✅ Analyzes charts passively
- ✅ Generates recommendations
- ✅ User applies changes manually
- ✅ No API dependencies
- ✅ Lightweight & stable

This is actually **better** because:
1. **More control**: You decide what to add/remove
2. **No rate limits**: No Spotify API calls
3. **Longer term**: No OAuth token expiration issues
4. **Better quality**: Manual curation maintains playlist integrity
5. **Sustainable**: Doesn't depend on API availability

## Summary

**LegalBaby v4** is a complete reimagining of the system as a **personal playlist intelligence dashboard** that helps you maintain high-quality playlists by:

1. Monitoring charts automatically
2. Detecting meaningful changes
3. Generating actionable reports
4. Letting YOU decide what to add/remove
5. Maintaining historical data for trends

It's no longer a bot. It's a **personal chart analyst** that works for you.

---

**Version**: 4.0  
**Last Updated**: June 1, 2026  
**Status**: Production Ready  
**Spotify API Usage**: Zero  
**Maintenance**: Minimal
