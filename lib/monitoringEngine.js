/**
 * Monitoring Engine - Core intelligence system
 * 
 * Handles:
 * - Daily Top 100 playlist snapshots
 * - Weekly genre playlist analysis
 * - Comparison and change detection
 * - Report generation
 */

const fs = require('fs');
const path = require('path');
const { fetchTopSongsByRegion, fetchTopSongsByGenre } = require('./appleMusicFetcher');
const snapshotManager = require('./snapshotManager');
const intelligenceEngine = require('./intelligenceEngine');
const reportGenerator = require('./reportGenerator');
const { PLAYLISTS } = require('../config');

// Ensure data directories exist
function ensureDataDirs() {
  const dirs = [
    'data/snapshots/daily',
    'data/snapshots/weekly',
    'data/reports/daily',
    'data/reports/weekly',
    'data/history'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Keep only recent data to avoid unbounded growth.
  snapshotManager.pruneOldData(30);
}

/**
 * Daily monitoring - Top 100 playlists
 */
async function runDailyUpdate(forceBaseline = false) {
  console.log('\n' + '='.repeat(60));
  console.log('DAILY MONITORING RUN:', new Date().toISOString());
  console.log('='.repeat(60) + '\n');

  ensureDataDirs();

  const allReports = [];

  // Process each regional Top 100 playlist
  for (const playlist of PLAYLISTS.top100 || []) {
    try {
      console.log(`📊 Monitoring: ${playlist.name}...`);

      // Step 1: Scrape current top 100
      const currentCharts = await fetchTopSongsByRegion(playlist.sources || []);

      if (!Array.isArray(currentCharts) || currentCharts.length === 0) {
        console.log(`   ⚠️ Skipping ${playlist.name}: scrape returned 0 tracks (keeping previous baseline)`);
        continue;
      }

      // Step 2: Get previous snapshot
      const previousSnapshot = snapshotManager.getLatestSnapshot('daily', playlist.trackingKey);
      const isBaseline = forceBaseline || !previousSnapshot;

      // Step 3: Compare and detect changes
      const changes = intelligenceEngine.detectChanges(
        isBaseline ? [] : (previousSnapshot ? previousSnapshot.tracks : []),
        currentCharts,
        playlist.name
      );

      // Step 4: Save new snapshot
      snapshotManager.saveSnapshot('daily', playlist.trackingKey, {
        playlistName: playlist.name,
        timestamp: new Date().toISOString(),
        baselineRun: isBaseline,
        trackCount: currentCharts.length,
        tracks: currentCharts,
        changes
      });

      // Step 5: Generate report
      const report = reportGenerator.generateDailyReport(
        playlist.name,
        changes,
        isBaseline ? [] : (previousSnapshot ? previousSnapshot.tracks : []),
        currentCharts
      );

      report.baselineRun = isBaseline;
      report.mode = isBaseline ? 'baseline' : 'delta';

      allReports.push(report);

      console.log(`   ✓ Changes detected: +${changes.added.length} -${changes.removed.length} moved:${changes.moved.length}`);

    } catch (error) {
      console.error(`   ✗ Error processing ${playlist.name}:`, error.message);
    }
  }

  // Save combined daily report
  const dailyReportPath = path.join('data/reports/daily', `${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(dailyReportPath, JSON.stringify(allReports, null, 2));

  console.log('\n✓ Daily monitoring complete');
  return allReports;
}

/**
 * Weekly monitoring - Genre playlists with intelligent ranking
 */
async function runWeeklyUpdate(forceBaseline = false) {
  console.log('\n' + '='.repeat(60));
  console.log('WEEKLY GENRE ANALYSIS:', new Date().toISOString());
  console.log('='.repeat(60) + '\n');

  ensureDataDirs();

  const allReports = [];

  // Process each genre playlist
  for (const playlist of PLAYLISTS.genres || []) {
    try {
      console.log(`🎵 Analyzing: ${playlist.name}...`);

      // Step 1: Scrape from multiple sources
      const genreTracks = await fetchTopSongsByGenre(playlist.sources || []);

      if (!Array.isArray(genreTracks) || genreTracks.length === 0) {
        console.log(`   ⚠️ Skipping ${playlist.name}: scrape returned 0 tracks (keeping previous baseline)`);
        continue;
      }

      // Step 2: Intelligently score and rank
      const rankedTracks = intelligenceEngine.intelligentlyRankGenreTracks(genreTracks, 50);

      if (!Array.isArray(rankedTracks) || rankedTracks.length === 0) {
        console.log(`   ⚠️ Skipping ${playlist.name}: ranking returned 0 tracks`);
        continue;
      }

      // Step 3: Get previous week's snapshot
      const previousSnapshot = snapshotManager.getLatestSnapshot('weekly', playlist.trackingKey);
      const isBaseline = forceBaseline || !previousSnapshot;

      // Step 4: Detect changes
      const changes = intelligenceEngine.detectChanges(
        isBaseline ? [] : (previousSnapshot ? previousSnapshot.tracks : []),
        rankedTracks,
        playlist.name
      );

      // Step 5: Save new snapshot
      snapshotManager.saveSnapshot('weekly', playlist.trackingKey, {
        playlistName: playlist.name,
        timestamp: new Date().toISOString(),
        baselineRun: isBaseline,
        trackCount: rankedTracks.length,
        tracks: rankedTracks,
        changes,
        sources: playlist.sources.length
      });

      // Step 6: Generate report
      const report = reportGenerator.generateWeeklyReport(
        playlist.name,
        changes,
        isBaseline ? [] : (previousSnapshot ? previousSnapshot.tracks : []),
        rankedTracks
      );

      report.baselineRun = isBaseline;
      report.mode = isBaseline ? 'baseline' : 'delta';

      allReports.push(report);

      console.log(`   ✓ Ranked ${rankedTracks.length} tracks, changes: +${changes.added.length} -${changes.removed.length}`);

    } catch (error) {
      console.error(`   ✗ Error analyzing ${playlist.name}:`, error.message);
    }
  }

  // Save combined weekly report
  const weekStart = getWeekStart(new Date());
  const weeklyReportPath = path.join('data/reports/weekly', `week-${weekStart}.json`);
  fs.writeFileSync(weeklyReportPath, JSON.stringify(allReports, null, 2));

  console.log('\n✓ Weekly analysis complete');
  return allReports;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

module.exports = {
  runDailyUpdate,
  runWeeklyUpdate,
  ensureDataDirs
};
