/**
 * Report Generator - Creates human-readable change reports
 * 
 * Generates clean, actionable reports for:
 * - Daily Top 100 updates
 * - Weekly genre analysis
 * - Dashboard display
 */

const fs = require('fs');
const path = require('path');

class ReportGenerator {
  /**
   * Generate a daily Top 100 report
   * @param {string} playlistName - name of playlist
   * @param {object} changes - changes object from intelligenceEngine
   * @param {array} currentChart - current full chart
   * @returns {object} formatted report
   */
  generateDailyReport(playlistName, changes, previousChart, currentChart) {
    const report = {
      type: 'daily',
      playlistName,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      summary: {
        totalTracks: currentChart.length,
        newEntries: changes.added.length,
        removals: changes.removed.length,
        movements: changes.moved.length,
        staleRemoved: changes.stale.length
      },
      newEntries: this.formatAdditions(changes.added),
      removals: this.formatRemovals(changes.removed),
      movements: this.formatMovements(changes.moved),
      instructions: this.generateInstructions('daily', changes),
      syncPlan: this.generateSyncPlan(previousChart || [], currentChart || []),
      topTracks: currentChart.slice(0, 100).map((t, i) => ({
        position: i + 1,
        name: t.name,
        artist: t.artist,
        score: t.score
      }))
    };

    return report;
  }

  /**
   * Generate a weekly genre report
   * @param {string} playlistName - name of playlist
   * @param {object} changes - changes object from intelligenceEngine
   * @param {array} currentRanking - current ranked tracks
   * @returns {object} formatted report
   */
  generateWeeklyReport(playlistName, changes, previousRanking, currentRanking) {
    const report = {
      type: 'weekly',
      playlistName,
      week: this.getWeekLabel(new Date()),
      timestamp: new Date().toISOString(),
      summary: {
        totalTracks: currentRanking.length,
        newHotSongs: changes.added.length,
        removedSongs: changes.removed.length,
        positionChanges: changes.moved.length
      },
      hotNewSongs: this.formatAdditions(changes.added),
      songsToRemove: this.formatRemovals(changes.removed),
      positionAdjustments: this.formatMovements(changes.moved),
      instructions: this.generateInstructions('weekly', changes),
      syncPlan: this.generateSyncPlan(previousRanking || [], currentRanking || []),
      topNewSongs: changes.added
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 10)
        .map(t => ({
          name: t.name,
          artist: t.artist,
          suggestedPosition: t.position,
          momentum: 'new'
        })),
      topTracks: currentRanking.slice(0, 50).map((t, i) => ({
        position: t.position || (i + 1),
        name: t.name,
        artist: t.artist,
        score: t.score || t.finalScore || 0
      }))
    };

    return report;
  }

  /**
   * Format additions for display
   * @param {array} additions - added tracks
   * @returns {array} formatted for display
   */
  formatAdditions(additions) {
    return additions
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .map(track => ({
        name: track.name,
        artist: track.artist,
        position: track.position,
        action: `ADD at #${track.position}`
      }));
  }

  /**
   * Format removals for display
   * @param {array} removals - removed tracks
   * @returns {array} formatted for display
   */
  formatRemovals(removals) {
    return removals.map(track => ({
      name: track.name,
      artist: track.artist,
      reason: track.reason || 'removed',
      age: track.age ? `${track.age} days old` : 'unknown',
      action: 'REMOVE'
    }));
  }

  /**
   * Format movements for display
   * @param {array} movements - moved tracks
   * @returns {array} formatted for display
   */
  formatMovements(movements) {
    return movements
      .sort((a, b) => Math.abs(b.movement) - Math.abs(a.movement))
      .map(track => ({
        name: track.name,
        artist: track.artist,
        from: `#${track.from}`,
        to: `#${track.to}`,
        movement: track.movement,
        action: `MOVE from #${track.from} to #${track.to}`
      }));
  }

  /**
   * Generate actionable instructions
   * @param {string} type - 'daily' or 'weekly'
   * @param {object} changes - changes object
   * @returns {array} action items
   */
  generateInstructions(type, changes) {
    const instructions = [];

    // Additions
    if (changes.added.length > 0) {
      instructions.push({
        action: 'ADD_TRACKS',
        count: changes.added.length,
        items: changes.added.map(t => ({
          track: t.name,
          artist: t.artist,
          position: t.position
        }))
      });
    }

    // Removals
    if (changes.removed.length > 0) {
      instructions.push({
        action: 'REMOVE_TRACKS',
        count: changes.removed.length,
        items: changes.removed.map(t => ({
          track: t.name,
          artist: t.artist,
          reason: t.reason
        }))
      });
    }

    // Movements
    if (changes.moved.length > 0) {
      instructions.push({
        action: 'REORDER_TRACKS',
        count: changes.moved.length,
        items: changes.moved.map(t => ({
          track: t.name,
          artist: t.artist,
          from: t.from,
          to: t.to
        }))
      });
    }

    return instructions;
  }

  /**
   * Generate an exact, ordered sync plan that transforms the previous chart
   * into the newly scraped chart. Following these steps reproduces Apple order.
   * @param {array} previousTracks
   * @param {array} currentTracks
   * @returns {array}
   */
  generateSyncPlan(previousTracks, currentTracks) {
    if (!Array.isArray(previousTracks) || previousTracks.length === 0) {
      return currentTracks.slice(0, 100).map((track, index) => ({
        type: 'SET',
        position: index + 1,
        track: track.name,
        artist: track.artist,
        action: `SET #${index + 1}  ${track.artist} - ${track.name}`
      }));
    }

    const keyFor = (track) => `${(track.name || '').trim().toLowerCase()}__${(track.artist || '').trim().toLowerCase()}`;
    const currentKeys = new Set(currentTracks.map(keyFor));
    const working = previousTracks.map(track => ({ ...track }));
    const steps = [];

    for (let index = working.length - 1; index >= 0; index--) {
      if (!currentKeys.has(keyFor(working[index]))) {
        const [removed] = working.splice(index, 1);
        steps.push({
          type: 'REMOVE',
          from: index + 1,
          track: removed.name,
          artist: removed.artist,
          action: `REMOVE #${index + 1}  ${removed.artist} - ${removed.name}`
        });
      }
    }

    for (let targetIndex = 0; targetIndex < currentTracks.length; targetIndex++) {
      const targetTrack = currentTracks[targetIndex];
      const targetKey = keyFor(targetTrack);
      const existingIndex = working.findIndex(track => keyFor(track) === targetKey);

      if (existingIndex === -1) {
        working.splice(targetIndex, 0, { ...targetTrack });
        steps.push({
          type: 'ADD',
          to: targetIndex + 1,
          track: targetTrack.name,
          artist: targetTrack.artist,
          action: `ADD #${targetIndex + 1}  ${targetTrack.artist} - ${targetTrack.name}`
        });
        continue;
      }

      if (existingIndex !== targetIndex) {
        const [moved] = working.splice(existingIndex, 1);
        working.splice(targetIndex, 0, moved);
        steps.push({
          type: 'MOVE',
          from: existingIndex + 1,
          to: targetIndex + 1,
          track: moved.name,
          artist: moved.artist,
          action: `MOVE #${existingIndex + 1} -> #${targetIndex + 1}  ${moved.artist} - ${moved.name}`
        });
      }
    }

    return steps;
  }

  /**
   * Get week label
   * @param {Date} date - date in the week
   * @returns {string} week label
   */
  getWeekLabel(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(d.setDate(diff));
    const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));

    return `${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`;
  }

  /**
   * Save report to file
   * @param {string} type - 'daily' or 'weekly'
   * @param {object} report - report object
   */
  saveReport(type, report) {
    const dir = path.join('data/reports', type);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const dateKey = type === 'weekly' ? this.getWeekLabel(new Date()).split(' ')[0] : report.date;
    const playlistKey = report.playlistName.toLowerCase().replace(/\s+/g, '-');
    const filename = `${playlistKey}-${dateKey}.json`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    return filepath;
  }

  /**
   * Generate text summary for console
   * @param {object} report - report object
   * @returns {string} formatted text
   */
  generateTextSummary(report) {
    let text = `\n${'='.repeat(60)}\n`;
    text += `${report.playlistName.toUpperCase()}\n`;
    text += `Date: ${report.date || report.week}\n`;
    text += `${'='.repeat(60)}\n\n`;

    if (report.newEntries && report.newEntries.length > 0) {
      text += `NEW ENTRIES (${report.newEntries.length})\n`;
      report.newEntries.forEach(track => {
        text += `  • ${track.name} by ${track.artist} at #${track.position}\n`;
      });
      text += '\n';
    }

    if (report.movements && report.movements.length > 0) {
      text += `POSITION CHANGES (${report.movements.length})\n`;
      report.movements.slice(0, 10).forEach(track => {
        text += `  • ${track.name} → #${track.to} (was #${track.from})\n`;
      });
      text += '\n';
    }

    if (report.removals && report.removals.length > 0) {
      text += `REMOVED (${report.removals.length})\n`;
      report.removals.forEach(track => {
        text += `  • ${track.name} (${track.reason})\n`;
      });
      text += '\n';
    }

    text += `${'='.repeat(60)}\n`;
    return text;
  }
}

module.exports = new ReportGenerator();
