# 🚀 LegalBaby v4 - Quick Start (TODAY)

**Date**: June 1, 2026, 1:00 AM UTC  
**Status**: Project cleaned ✅, Ready to run ✅

---

## ✨ Clean Project Structure

Your workspace now contains ONLY what's needed:

```
legalbaby-system/
├── .github/workflows/               ← GitHub Actions automation
│   ├── daily-monitoring.yml         (runs daily 12:00 AM UTC)
│   └── weekly-analysis.yml          (runs Saturday 12:00 AM UTC)
├── lib/                             ← Core system modules
│   ├── appleMusicFetcher.js         (scrapes charts)
│   ├── intelligenceEngine.js        (detects changes)
│   ├── monitoringEngine.js          (daily/weekly orchestration)
│   ├── reportGenerator.js           (formats reports)
│   ├── scheduler.js                 (scheduling)
│   ├── snapshotManager.js           (database)
│   ├── dashboardServer.js           (web interface)
│   └── config.js                    (configuration)
├── data/                            ← Generated data
│   ├── snapshots/daily/             (daily chart snapshots)
│   ├── snapshots/weekly/            (weekly genre snapshots)
│   ├── reports/daily/               (daily change reports)
│   └── reports/weekly/              (weekly analysis)
├── index-v4.js                      ← Main entry point
├── package.json                     ← Dependencies
├── config.js                        ← Configuration
├── README-V4.md                     ← Full documentation
├── IMPLEMENTATION_SUMMARY.md        ← Technical details
├── NEXT_STEPS.md                    ← Implementation timeline
└── CLAUDE_AI_PROMPT.md             ← Prompt for Claude AI help
```

---

## 🎯 TODAY'S MISSION (June 1)

### Step 1: Run Initial Seed NOW
```bash
node index-v4.js --now
```

**What this does**:
- Scrapes Top 100 charts from 5 regions
- Creates first snapshot (baseline)
- Generates report file
- Takes ~2-3 minutes

**You'll see**:
```
✓ Fetching top songs by region...
✓ Scraping region: Nigeria
✓ Scraping region: Ghana
✓ Scraping region: Global
✓ Scraping region: USA
✓ Scraping region: UK
✓ Daily monitoring complete
```

### Step 2: Find Generated Report
After running completes, your report is saved at:
```
data/reports/daily/2026-06-01.json
```

View it:
```bash
cat data/reports/daily/2026-06-01.json | jq .
```

Or open with:
- VS Code
- Any text editor
- Online JSON viewer

### Step 3: Extract Top 50 from Each Region

The report has this structure:
```json
{
  "type": "daily",
  "summaryByRegion": {
    "Nigeria": {
      "newEntries": [...],
      "topTracks": [...]
    },
    "Ghana": { ... },
    "Global": { ... },
    "USA": { ... },
    "UK": { ... }
  }
}
```

**You need to**:
1. Open `data/reports/daily/2026-06-01.json`
2. Find each region's section
3. Take the TOP 50 tracks (ranked by position 1-50)
4. Copy to a spreadsheet or document

**Format you need**:
```
REGION: Nigeria
Track Name | Artist | Position
-----------+--------+---------
Song 1     | Artist | 1
Song 2     | Artist | 2
Song 3     | Artist | 3
...
Song 50    | Artist | 50

REGION: Ghana
... (repeat for all 5 regions)
```

### Step 4: Manually Add to Spotify
Once you have the top 50 from each region:
1. Open Spotify
2. Create/update your "GENRU" playlists
3. Add the 50 tracks to each playlist
4. System will remember these as your baseline

---

## 🔔 TOMORROW (June 2)

### ⏰ At 12:00 AM UTC
- GitHub Actions automatically runs (if you pushed to GitHub)
- OR system runs locally if you kept it running
- Scrapes today's Top 100
- Compares vs June 1's snapshot
- Shows ONLY changes

**Report at**: `data/reports/daily/2026-06-02.json`

**You'll see**:
```json
{
  "date": "2026-06-02",
  "changes": {
    "newEntries": 3,     ← Only 3 new songs
    "removals": 1,       ← 1 fell out
    "movements": 5       ← 5 changed positions
  },
  "details": [
    "ADD: Song X by Artist X (Position 47)",
    "REMOVE: Song Y by Artist Y",
    "MOVE: Song Z to Position 15 (was 23)"
  ]
}
```

**You do**:
- Review the 3 new songs
- Add them to Spotify
- Remove the 1 old song
- Apply the 5 position changes

---

## 📅 WEEKLY (Saturday, June 7)

### ⏰ At 12:00 AM UTC
- GitHub Actions automatically runs genre analysis
- Scrapes 6 genres × 7-12 Apple Music sources each
- Intelligently ranks by momentum
- Generates recommendations

**Report at**: `data/reports/weekly/week-2026-06-01.json`

**You'll see**:
```json
{
  "genres": {
    "Gospel": {
      "hotNewSongs": [...],
      "staleTracks": [...],
      "recommendations": [...]
    },
    "Afrobeats": { ... },
    "HipHop": { ... },
    "RnB": { ... },
    "Amapiano": { ... },
    "EDM": { ... }
  }
}
```

---

## 🌐 Access Dashboard

### Option 1: Local (Development)
```bash
node index-v4.js --schedule
```

Then open browser:
```
http://localhost:3000
```

**Dashboard shows**:
- Daily Top 100 reports
- Weekly genre analysis
- Historical trends
- All change details

### Option 2: GitHub (Production)
Once pushed to GitHub:
1. Results automatically saved to repo
2. Can view raw reports in GitHub
3. Can set up GitHub Pages for dashboard

---

## ⚙️ Automation Setup

### If Using GitHub Actions (Recommended)
1. Initialize git:
   ```bash
   git init
   git add .
   git commit -m "LegalBaby v4 - Initial setup"
   ```

2. Create GitHub repository

3. Push code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/legalbaby-system.git
   git push -u origin main
   ```

4. GitHub Actions automatically:
   - Runs daily @ 12:00 AM UTC
   - Runs weekly @ Saturday 12:00 AM UTC
   - Auto-commits reports to repo

### If Using Local Scheduler
```bash
node index-v4.js --schedule
# Runs 24/7 in current terminal
# Ctrl+C to stop
```

---

## 📊 Report Files Location

All generated data saved to:

**Daily Monitoring**:
- Report: `data/reports/daily/2026-06-01.json`
- Snapshots: `data/snapshots/daily/top100_*.json` (1 per region)

**Weekly Analysis**:
- Report: `data/reports/weekly/week-2026-06-01.json`
- Snapshots: `data/snapshots/weekly/gospel.json`, `afrobeats.json`, etc.

**Historical Data**:
- All reports kept for trend analysis
- Easy to compare June 1 vs June 8 vs July 1

---

## 🐛 Troubleshooting

### System won't start
```bash
# Check Node.js version
node --version
# Should be v20+

# Check npm install worked
npm list
# Should show all dependencies
```

### Port 3000 already in use
```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (Windows)
taskkill /PID <PID> /F
```

### Reports not being generated
```bash
# Run with verbose output
node index-v4.js --now

# Check internet connection (needs to reach Apple Music)
# Check data/ directory permissions
```

### Dashboard showing no data
```bash
# Make sure you ran the monitoring first
node index-v4.js --now

# Then start dashboard
node index-v4.js --schedule

# Wait 5 seconds for server to start
# Visit http://localhost:3000
```

---

## 📝 Need More Help?

**Read these files**:
1. `NEXT_STEPS.md` - Detailed timeline & workflow
2. `README-V4.md` - Complete documentation
3. `IMPLEMENTATION_SUMMARY.md` - Technical details
4. `CLAUDE_AI_PROMPT.md` - Copy/paste to Claude AI

**Or use the Claude AI prompt**:
Open `CLAUDE_AI_PROMPT.md`, copy the prompt, paste into Claude AI for detailed help.

---

## ✅ Checklist for TODAY

- [ ] Run: `node index-v4.js --now`
- [ ] Wait for completion (2-3 minutes)
- [ ] Find report: `data/reports/daily/2026-06-01.json`
- [ ] Extract top 50 from each region
- [ ] Add 250 tracks to Spotify GENRU playlists
- [ ] System now has baseline snapshot
- [ ] Tomorrow it shows ONLY changes

---

## 🎉 That's It!

You now have:
✅ Clean project (no debug files)
✅ Initial seed running
✅ Baseline snapshot saved
✅ Reports being generated
✅ Dashboard ready
✅ GitHub Actions configured
✅ Automation scheduled

**Next**: Run `node index-v4.js --now` and let the system do its thing.

Everything else runs automatically. 🚀
