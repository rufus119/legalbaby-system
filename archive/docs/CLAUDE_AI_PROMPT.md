# Prompt to Use with Claude AI for LegalBaby v4 Setup

**Copy and paste the following prompt into Claude AI to get detailed help:**

---

## 📝 CLAUDE AI PROMPT

I have a Node.js playlist monitoring system called LegalBaby v4 running in this directory:
`c:\Users\diric\OneDrive\Desktop\legalbaby-system`

**What it does:**
- Scrapes Apple Music Top 100 charts daily (5 regions: Nigeria, Ghana, Global, USA, UK)
- Scrapes 6 genre playlists weekly (Gospel, Afrobeats, Hip Hop, R&B, Amapiano, EDM)
- Detects changes (additions, removals, position changes) between snapshots
- Generates reports with actionable recommendations
- Has a web dashboard at http://localhost:3000
- Uses GitHub Actions for automated scheduling

**My situation:**
- Today is June 1, 2026 @ 1:00 AM UTC
- This is the FIRST day the system is running
- I need to manually add tracks to my Spotify playlists based on recommendations

**What I need help with:**

### Part 1: Initial Setup Today
I need to:
1. Run the daily monitoring RIGHT NOW to get a baseline snapshot
2. Extract the TOP 50 tracks from each region (I'll manually add these to Spotify as foundation)
3. Let the system REMEMBER these 50 as the baseline

The command to run: `node index-v4.js --now`

**Question**: How do I ensure the system saves today's run as the baseline it will compare against tomorrow? Should I create a special "baseline" snapshot or does each daily run automatically become the baseline?

---

### Part 2: Delta Tracking (Tomorrow onwards)
Starting June 2 at 12:00 AM UTC, I want:
- The system to compare TODAY's Top 100 vs YESTERDAY's Top 100
- ONLY show me what CHANGED (not the whole 100 again)
- Example: "3 new tracks, 1 removed, 5 moved positions"

**Question**: The current `intelligenceEngine.js` does have a `detectChanges()` function. Is this automatically being called in the daily monitoring, or do I need to modify `monitoringEngine.js` to make sure it's comparing current snapshot vs previous snapshot?

---

### Part 3: Weekly Genre Analysis (Saturday June 7)
The GitHub Actions workflow `.github/workflows/weekly-analysis.yml` is set to run Saturdays at 12:00 AM UTC.

**Question**: Does the weekly analysis:
1. Save its results to `data/reports/weekly/` automatically?
2. Compare this week's genre playlists to LAST WEEK (or just create a fresh ranking)?
3. Get displayed on the dashboard automatically?

---

### Part 4: Dashboard Access & Data Display
I want to access the dashboard at http://localhost:3000

**Questions**:
1. Do I need to start the system with `node index-v4.js --schedule` to run the dashboard?
2. Will the dashboard automatically show today's report when I visit it?
3. Which file does the dashboard read to display reports: `data/reports/daily/*.json` or somewhere else?
4. The dashboard API endpoints are in `dashboardServer.js`. Are all of them wired up to actually read from the `data/` directory?

---

### Part 5: GitHub Actions Automation
I have two workflows ready:
- `.github/workflows/daily-monitoring.yml` - runs daily at 12:00 AM UTC
- `.github/workflows/weekly-analysis.yml` - runs Saturday 12:00 AM UTC

**Questions**:
1. Once I push to GitHub, will these run automatically without any additional setup?
2. Should I test locally first with `node index-v4.js --now` before enabling GitHub Actions?
3. Do the workflows have all the dependencies they need (node_modules), or do they use `npm install` to get dependencies?
4. Can I manually trigger a workflow run from GitHub to test before the scheduled times?

---

### Part 6: Report Data Structure
I see reports are being saved to JSON. 

**Question**: The current report generator in `reportGenerator.js` creates reports with this structure:
```json
{
  "type": "daily",
  "playlistName": "Top 100 Nigeria",
  "summary": { ... },
  "newEntries": [ ... ],
  "removals": [ ... ],
  "movements": [ ... ]
}
```

Is there a way to aggregate all 5 daily reports (Nigeria, Ghana, Global, USA, UK) into ONE report file that shows changes across all regions? Or should I keep them separate?

---

### Part 7: System Memory & Persistence
The system needs to "remember" what was in yesterday's snapshot to compare against today.

**Question**: Does `snapshotManager.js` automatically handle this by:
1. Saving each day's snapshot with a date stamp?
2. The `getLatestSnapshot()` function retrieving yesterday's snapshot?
3. The comparison happening automatically in `monitoringEngine.js`?

Or do I need to manually call functions to ensure comparison is happening?

---

### Help Me Verify
Can you help me confirm:
1. Is `monitoringEngine.js` `runDailyUpdate()` function actually calling the comparison/detection functions?
2. Are report files actually being saved to disk (`data/reports/daily/*.json`)?
3. Are the GitHub Actions workflows correctly configured and ready to auto-run?
4. Will the dashboard display reports if I visit `http://localhost:3000`?

---

### What I Want to Happen

**TODAY (June 1)**:
- Run system → Get first 100 tracks (5 regions × 100 = 500 tracks total)
- Take top 50 from each region (250 tracks total)
- Manually add to Spotify
- System saves these as baseline

**TOMORROW (June 2, 12:00 AM UTC)**:
- System scrapes new Top 100
- Compares vs June 1
- Shows ONLY changes (3 new, 1 removed, etc.)
- I apply changes to Spotify

**ONGOING FOREVER**:
- Each day: See only what changed
- Each Saturday: See genre recommendations
- Dashboard always shows latest updates
- No manual intervention needed except applying Spotify changes

---

**Can you help me ensure this workflow is properly set up and working correctly?**

---

## 🎯 WHAT TO ASK CLAUDE AFTER THIS

After pasting the above prompt, follow up with:

1. **"Can you walk me through the exact steps to run the initial seed TODAY?"**

2. **"Show me how to extract just the top 50 from the JSON report file"**

3. **"How do I manually test the delta tracking locally before enabling GitHub Actions?"**

4. **"Walk me through what I'll see on the dashboard at http://localhost:3000"**

5. **"Give me a checklist of everything I need to verify before pushing to GitHub"**

6. **"What could go wrong with the automation and how do I troubleshoot?"**

---

