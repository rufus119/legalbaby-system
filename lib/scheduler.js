/**
 * Scheduler - Automated playlist monitoring schedule
 * 
 * Schedules:
 * - Daily Top 100 monitoring at 12:00 AM
 * - Weekly genre analysis at Saturday 12:00 AM
 */

const schedule = require('node-schedule');
const { runDailyUpdate, runWeeklyUpdate } = require('./monitoringEngine');
const reportGenerator = require('./reportGenerator');

let dailyJob = null;
let weeklyJob = null;

/**
 * Schedule all monitoring tasks
 */
function schedulePlaylistMonitoring() {
  console.log('Scheduling playlist monitoring tasks...\n');

  // Daily Top 100 update at midnight (00:00)
  dailyJob = schedule.scheduleJob('0 0 * * *', async () => {
    console.log('\n🌙 DAILY MONITORING TRIGGER (midnight)');
    try {
      const reports = await runDailyUpdate();
      reports.forEach(report => {
        const summary = reportGenerator.generateTextSummary(report);
        console.log(summary);
        reportGenerator.saveReport('daily', report);
      });
    } catch (error) {
      console.error('❌ Daily update failed:', error.message);
    }
  });

  // Weekly genre analysis at Saturday midnight (00:00)
  weeklyJob = schedule.scheduleJob('0 0 * * 6', async () => {
    console.log('\n📊 WEEKLY ANALYSIS TRIGGER (Saturday midnight)');
    try {
      const reports = await runWeeklyUpdate();
      reports.forEach(report => {
        const summary = reportGenerator.generateTextSummary(report);
        console.log(summary);
        reportGenerator.saveReport('weekly', report);
      });
    } catch (error) {
      console.error('❌ Weekly update failed:', error.message);
    }
  });

  console.log('✓ Daily monitoring scheduled for 00:00 UTC');
  console.log('✓ Weekly analysis scheduled for Saturday 00:00 UTC');
  console.log('✓ Scheduler active and waiting for triggers...\n');
}

/**
 * Get next scheduled run times
 */
function getScheduleTimes() {
  return {
    daily: dailyJob ? dailyJob.nextInvocation() : null,
    weekly: weeklyJob ? weeklyJob.nextInvocation() : null
  };
}

/**
 * Stop all scheduled jobs
 */
function stopScheduler() {
  if (dailyJob) dailyJob.cancel();
  if (weeklyJob) weeklyJob.cancel();
  console.log('Scheduler stopped');
}

module.exports = {
  schedulePlaylistMonitoring,
  getScheduleTimes,
  stopScheduler
};
