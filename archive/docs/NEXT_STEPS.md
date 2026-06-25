# LegalBaby v4 - Next Steps & Detailed Setup Guide

**Status**: June 1, 2026 @ 1:00 AM UTC  
**Your Project**: Clean, ready for implementation

---

## 📊 What You Need Right Now

### 1️⃣ INITIAL SEED (Today - June 1)

**Goal**: Get the first 50 tracks from Top 100 charts to populate your GENRU playlists

**What this means**:
- The system scrapes Top 100 charts from 5 regions (Nigeria, Ghana, Global, USA, UK)
- Takes the top 50 tracks (pioneers/foundation tracks)
- Saves them as your "baseline" in the system memory
- You manually add these 50 to your Spotify "GENRU" playlists

**File created today**:
```
data/reports/daily/2026-06-01.json
```

This file contains:
- All 100 tracks from each region
- But YOU ONLY NEED THE TOP 50

**To get the first 50 tracks right now:**
```bash
node index-v4.js --now
```

This creates the initial baseline snapshot the system will compare against.

---

### 2️⃣ DELTA TRACKING (Tomorrow onwards - June 2)

**How it works**:
- **Today (June 1)**: System creates baseline snapshot (all 100 tracks)
- **Tomorrow (June 2, 12:00 AM)**: System compares new 100 vs yesterday's 100
- **Output**: ONLY the changes:
  - ✅ 3 new tracks entered the Top 100
  - ❌ 2 tracks fell out
  - 🔄 5 tracks moved positions
  - 🚨 1 track is now stale (older than 2 days)

**You only get what changed**, not the whole 100 again.

---

### 3️⃣ WEEKLY GENRE ANALYSIS (Saturday - June 7, 12:00 AM)

**What happens**:
- Every Saturday at midnight, system analyzes 6 genres:
  - Gospel, Afrobeats, Hip Hop, R&B, Amapiano, EDM
- Scrapes 7-12 Apple Music sources per genre
- Intelligently ranks by momentum (rising tracks get priority)
- Gives you: Hot new tracks to add, stale tracks to remove, positions to adjust

**First update**: Saturday June 7

---

## 🌐 Dashboard Access

### How to Access
1. **Start the system**:
   ```bash
   node index-v4.js --schedule
   ```

2. **Open in browser**:
   ```
   http://localhost:3000
   ```

3. **What you see**:
   - Daily Top 100 reports with changes
   - Weekly genre analysis with recommendations
   - Historical reports
   - Beautiful Spotify-green themed interface

### Dashboard Features
- Click any report to see detailed changes
- View instructions: What to ADD, REMOVE, MOVE in Spotify
- See historical trends
- Status dashboard showing last run times

---

## 🔄 Automation Setup (GitHub Actions)

### What's Already Done ✅
The system is configured with two GitHub Actions workflows:

**Daily Workflow**: `.github/workflows/daily-monitoring.yml`
- Runs every day at **12:00 AM UTC**
- Scrapes Top 100 charts
- Compares with previous day
- Saves changes to repo

**Weekly Workflow**: `.github/workflows/weekly-analysis.yml`
- Runs every Saturday at **12:00 AM UTC**
- Analyzes 6 genres
- Generates recommendations
- Saves to repo

### To Enable Automation
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "LegalBaby v4 - Initial commit"
   git push origin main
   ```

2. GitHub Actions will run automatically at scheduled times

3. Reports are auto-committed to your repo

### Manual Testing Before Full Automation
```bash
# Test daily monitoring
node index-v4.js --now

# Test weekly genre analysis
node index-v4.js --weekly

# Run full scheduler locally
node index-v4.js --schedule
```

---

## 📋 Detailed Implementation Timeline

### TODAY (June 1, 2026)
- [ ] Run initial seed: `node index-v4.js --now`
- [ ] Check generated report: `data/reports/daily/2026-06-01.json`
- [ ] Extract top 50 tracks from each region
- [ ] Manually add to your GENRU playlists on Spotify
- [ ] System now knows these are your baseline

### DAILY (June 2 onwards, 12:00 AM UTC)
- [ ] GitHub Actions automatically runs
- [ ] System compares today's Top 100 vs yesterday's
- [ ] Report saved: `data/reports/daily/2026-06-02.json`
- [ ] Dashboard shows: +2 new, -1 removed, 3 moved
- [ ] You review and apply changes to Spotify

### WEEKLY (Saturday June 7, 12:00 AM UTC)
- [ ] GitHub Actions runs weekly analysis
- [ ] 6 genres analyzed across 50+ sources
- [ ] Report saved: `data/reports/weekly/week-2026-06-01.json`
- [ ] Dashboard shows: Hot tracks, removals, adjustments
- [ ] You apply genre playlist updates

### ONGOING
- Each day: Review changes, apply to Spotify
- Each week: Review genre recommendations, update playlists
- System learns your preferences over time

---

## 💡 How to Use Reports

### Daily Report Structure
```json
{
  "date": "2026-06-01",
  "type": "daily",
  "summary": {
    "totalNewEntries": 3,
    "totalRemovals": 1,
    "totalMovements": 5
  },
  "newEntries": [
    {
      "position": 14,
      "name": "Song Name",
      "artist": "Artist Name",
      "region": "Nigeria"
    }
  ],
  "removals": [...],
  "movements": [...],
  "instructions": [
    "ADD: Song Name by Artist Name",
    "REMOVE: Old Song by Old Artist",
    "MOVE: Song to position 5 (was 8)"
  ]
}
```

### Weekly Report Structure
```json
{
  "week": "2026-06-01",
  "type": "weekly",
  "genre": "Afrobeats",
  "hotNewSongs": [...],
  "recommendations": {
    "addThese": [...],
    "removeThese": [...],
    "reorderThese": [...]
  },
  "instructions": [...]
}
```

---

## ⚙️ System Configuration

**File**: `config.js`

**Daily Playlists**:
```javascript
top100: {
  ng: { name: "Top 100 Nigeria", ... },
  gh: { name: "Top 100 Ghana", ... },
  global: { name: "Top 100 Global", ... },
  us: { name: "Top 100 USA", ... },
  uk: { name: "Top 100 UK", ... }
}
```

**Weekly Playlists**:
```javascript
genres: {
  gospel: { name: "Gospel", sources: [...] },
  afrobeats: { name: "Afrobeats", sources: [...] },
  hiphop: { name: "Hip Hop", sources: [...] },
  randb: { name: "R&B", sources: [...] },
  amapiano: { name: "Amapiano", sources: [...] },
  edm: { name: "EDM", sources: [...] }
}
```

No Spotify credentials needed. Configuration is read-only.

---

## 🚀 Quick Start Commands

```bash
# 1. Initial seed (run TODAY)
node index-v4.js --now

# 2. View dashboard locally
node index-v4.js --schedule
# Open: http://localhost:3000

# 3. Test weekly genre analysis
node index-v4.js --weekly

# 4. Deploy to GitHub for automation
git push origin main
```

---

## 📁 File Locations

Your reports are saved at:
- **Daily reports**: `data/reports/daily/2026-06-0X.json`
- **Daily snapshots**: `data/snapshots/daily/top100_*-2026-06-0X.json`
- **Weekly reports**: `data/reports/weekly/week-2026-06-0X.json`
- **Weekly snapshots**: `data/snapshots/weekly/genre-2026-06-0X.json`

Each file is a complete JSON record you can parse programmatically or import into other systems.

---

## 🔧 Troubleshooting

### Dashboard won't load at http://localhost:3000
```bash
# Make sure you're running the scheduler
node index-v4.js --schedule
# Check that port 3000 is free
netstat -ano | findstr :3000
```

### No reports being generated
```bash
# Run manually to see errors
node index-v4.js --now
# Check error output
# Verify internet connection (needs to access Apple Music)
```

### GitHub Actions not running
```bash
# Check that workflows exist
ls -la .github/workflows/
# Verify workflows are valid YAML
# Check GitHub Actions tab in your repo
```

---

## 📊 What You'll See Over Time

### Week 1
- Daily tracking shows normal fluctuations
- Identify 10-15 new hot tracks to add each day
- Remove 2-3 stale tracks daily
- Weekly genre analysis gives bigger picture

### Week 2+
- Start seeing patterns (certain artists trending consistently)
- Identify rising stars (tracks moving up positions daily)
- Find falling tracks (worth removing)
- Understand seasonal trends

### Month 1
- Have rich history of chart movements
- Know your audience preferences
- Playlists stay fresh with daily updates
- Data-driven curation decisions

---

## ✅ Next Steps

1. **TODAY** - Run initial seed:
   ```bash
   node index-v4.js --now
   ```

2. **TODAY** - Extract top 50 from report
   ```
   data/reports/daily/2026-06-01.json
   ```

3. **TODAY** - Add 50 tracks to GENRU playlists in Spotify (manually)

4. **TOMORROW (June 2, 12:00 AM UTC)** - System automatically runs and shows changes only

5. **SATURDAY (June 7, 12:00 AM UTC)** - First weekly genre analysis

6. **ONGOING** - Review daily changes, apply to Spotify, let system track trends

---

## 💬 Questions?

- **Where's my data?** → `data/` directory
- **How do I see it?** → `http://localhost:3000`
- **When does it run?** → Daily 12 AM UTC, Weekly Saturday 12 AM UTC
- **Do I need Spotify API?** → No, just manual updates
- **Can I customize genres?** → Yes, edit `config.js`

---

**Status**: Ready to deploy  
**Version**: 4.0 Production  
**Next Action**: Run `node index-v4.js --now` TODAY
