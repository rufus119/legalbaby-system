/**
 * LegalBaby v4 - Playlist Intelligence Dashboard
 * 
 * NO LONGER a Spotify automation bot.
 * 
 * This is now a PLAYLIST INTELLIGENCE MONITORING SYSTEM that:
 * 1. Scrapes Apple Music charts/playlists daily
 * 2. Stores snapshots in local database
 * 3. Detects changes and movements
 * 4. Generates human-readable reports
 * 5. Displays recommendations on a dashboard
 * 
 * The user then MANUALLY applies changes to Spotify.
 */

const { schedulePlaylistMonitoring } = require('./lib/scheduler');
const dashboardServer = require('./lib/dashboardServer');
const fs = require('fs');
const path = require('path');

/**
 * Check if reports exist and auto-generate if needed
 */
async function ensureBaselineReports() {
  const snapshotManager = require('./lib/snapshotManager');
  snapshotManager.pruneOldData(30);

  const dailyReportDir = 'data/reports/daily';
  const weeklyReportDir = 'data/reports/weekly';
  
  // Check for daily reports
  const hasDailyReports = fs.existsSync(dailyReportDir) && 
    fs.readdirSync(dailyReportDir).some(f => f.endsWith('.json'));
  
  // Check for weekly reports
  const hasWeeklyReports = fs.existsSync(weeklyReportDir) && 
    fs.readdirSync(weeklyReportDir).some(f => f.endsWith('.json'));
  
  // Generate baseline if missing
  const { runDailyUpdate, runWeeklyUpdate, ensureDataDirs } = require('./lib/monitoringEngine');
  ensureDataDirs();
  
  if (!hasDailyReports) {
    console.log('📊 No daily reports found. Generating baseline...');
    try {
      await runDailyUpdate();
      console.log('✅ Daily baseline generated\n');
    } catch (error) {
      console.error('⚠️  Failed to generate daily baseline:', error.message);
    }
  }
  
  if (!hasWeeklyReports) {
    console.log('📈 No weekly reports found. Generating baseline...');
    try {
      await runWeeklyUpdate();
      console.log('✅ Weekly baseline generated\n');
    } catch (error) {
      console.error('⚠️  Failed to generate weekly baseline:', error.message);
    }
  }
}

async function main() {
  try {
    const args = process.argv.slice(2);

    if (args.includes('--schedule')) {
      // Production: run scheduled monitoring
      console.log('LegalBaby v4 - Playlist Intelligence Dashboard');
      console.log('Starting automated playlist monitoring...\n');
      
      // Auto-generate reports if they don't exist
      await ensureBaselineReports();
      
      schedulePlaylistMonitoring();
      
      // Start dashboard server on port 3000
      dashboardServer.start(3000);
      
      process.on('SIGTERM', () => {
        console.log('Shutting down...');
        process.exit(0);
      });
    } else if (args.includes('--now')) {
      // One-time run
      const { runDailyUpdate, runWeeklyUpdate } = require('./lib/monitoringEngine');
      await runDailyUpdate();
      process.exit(0);
    } else if (args.includes('--weekly')) {
      // Run weekly update only
      const { runWeeklyUpdate } = require('./lib/monitoringEngine');
      await runWeeklyUpdate();
      process.exit(0);
    } else {
      // Default: show help
      console.log('LegalBaby v4 - Playlist Intelligence Dashboard\n');
      console.log('Usage:');
      console.log('  node index.js --now      - Run daily monitoring once');
      console.log('  node index.js --weekly   - Run weekly genre analysis');
      console.log('  node index.js --schedule - Run with automatic scheduling\n');
    }
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
