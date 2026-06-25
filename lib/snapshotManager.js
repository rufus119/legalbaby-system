/**
 * Snapshot Manager - Local database of playlist states
 * 
 * Maintains historical records of:
 * - Daily Top 100 snapshots
 * - Weekly genre snapshots
 * - Change detection data
 * - Movement history
 */

const fs = require('fs');
const path = require('path');

class SnapshotManager {
  /**
   * Save a playlist snapshot
   * @param {string} type - 'daily' or 'weekly'
   * @param {string} trackingKey - playlist identifier
   * @param {object} data - snapshot data
   */
  saveSnapshot(type, trackingKey, data) {
    const dir = path.join('data/snapshots', type);
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `${trackingKey}-${this.getDateKey(type)}.json`;
    const filepath = path.join(dir, filename);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`   💾 Snapshot saved: ${filename}`);
  }

  /**
   * Get latest snapshot for a playlist
   * @param {string} type - 'daily' or 'weekly'
   * @param {string} trackingKey - playlist identifier
   * @returns {object} latest snapshot or null
   */
  getLatestSnapshot(type, trackingKey) {
    const dir = path.join('data/snapshots', type);
    
    if (!fs.existsSync(dir)) {
      return null;
    }

    const files = fs.readdirSync(dir)
      .filter(f => f.startsWith(trackingKey) && f.endsWith('.json'))
      .sort()
      .reverse();

    if (files.length === 0) {
      return null;
    }

    try {
      const filepath = path.join(dir, files[0]);
      const data = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading snapshot ${files[0]}:`, error.message);
      return null;
    }
  }

  /**
   * Get snapshot history for a playlist
   * @param {string} type - 'daily' or 'weekly'
   * @param {string} trackingKey - playlist identifier
   * @param {number} count - how many snapshots to retrieve
   * @returns {array} array of snapshots
   */
  getSnapshotHistory(type, trackingKey, count = 10) {
    const dir = path.join('data/snapshots', type);
    
    if (!fs.existsSync(dir)) {
      return [];
    }

    const files = fs.readdirSync(dir)
      .filter(f => f.startsWith(trackingKey) && f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, count);

    return files.map(filename => {
      try {
        const filepath = path.join(dir, filename);
        const data = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(data);
      } catch (error) {
        return null;
      }
    }).filter(s => s !== null);
  }

  /**
   * Get all snapshots for a specific date range
   * @param {string} type - 'daily' or 'weekly'
   * @param {Date} startDate - start date
   * @param {Date} endDate - end date
   * @returns {array} matching snapshots
   */
  getSnapshotsByDateRange(type, startDate, endDate) {
    const dir = path.join('data/snapshots', type);
    
    if (!fs.existsSync(dir)) {
      return [];
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    const snapshots = [];

    files.forEach(filename => {
      try {
        const filepath = path.join(dir, filename);
        const data = fs.readFileSync(filepath, 'utf8');
        const snapshot = JSON.parse(data);
        const snapshotDate = new Date(snapshot.timestamp);

        if (snapshotDate >= startDate && snapshotDate <= endDate) {
          snapshots.push(snapshot);
        }
      } catch (error) {
        // Skip invalid snapshots
      }
    });

    return snapshots.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Get date key for filename
   * @param {string} type - 'daily' or 'weekly'
   * @returns {string} date key
   */
  getDateKey(type) {
    const now = new Date();
    
    if (type === 'weekly') {
      const weekStart = this.getWeekStart(now);
      return weekStart.toISOString().split('T')[0];
    }
    
    return now.toISOString().split('T')[0];
  }

  /**
   * Get week start date (Monday)
   * @param {Date} date - any date in the week
   * @returns {Date} Monday of that week
   */
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  /**
   * Export snapshots to report format
   * @param {string} type - 'daily' or 'weekly'
   * @param {string} trackingKey - playlist identifier
   * @returns {array} formatted snapshots
   */
  exportSnapshots(type, trackingKey) {
    return this.getSnapshotHistory(type, trackingKey, 100);
  }

  /**
   * Prune old report/snapshot files older than N days
   * @param {number} days - retention window in days
   * @returns {object} delete counts by directory
   */
  pruneOldData(days = 30) {
    const targets = [
      'data/reports/daily',
      'data/reports/weekly',
      'data/snapshots/daily',
      'data/snapshots/weekly'
    ];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const results = {};

    targets.forEach((dir) => {
      let deleted = 0;
      if (!fs.existsSync(dir)) {
        results[dir] = 0;
        return;
      }

      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
      files.forEach((filename) => {
        const filepath = path.join(dir, filename);
        try {
          const stat = fs.statSync(filepath);
          if (stat.mtime < cutoff) {
            fs.unlinkSync(filepath);
            deleted++;
          }
        } catch {
          // Ignore file-specific pruning errors
        }
      });

      results[dir] = deleted;
    });

    return results;
  }

  /**
   * Delete all report/snapshot JSON data and recreate directories.
   * @returns {object} file delete counts by directory
   */
  resetAllData() {
    const targets = [
      'data/reports/daily',
      'data/reports/weekly',
      'data/snapshots/daily',
      'data/snapshots/weekly'
    ];

    const results = {};

    targets.forEach((dir) => {
      let deleted = 0;
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
        files.forEach((filename) => {
          const filepath = path.join(dir, filename);
          try {
            fs.unlinkSync(filepath);
            deleted++;
          } catch {
            // Ignore individual file delete errors.
          }
        });
      } else {
        fs.mkdirSync(dir, { recursive: true });
      }

      results[dir] = deleted;
    });

    return results;
  }
}

module.exports = new SnapshotManager();
