/**
 * Intelligence Engine - Change detection and ranking
 * 
 * Handles:
 * - Comparing playlist snapshots
 * - Detecting additions, removals, movements
 * - Intelligent track ranking by momentum
 * - Stale track identification
 */

class IntelligenceEngine {
  /**
   * Detect changes between two playlist states
   * @param {array} oldTracks - previous state
   * @param {array} newTracks - current state
   * @param {string} playlistName - for logging
   * @returns {object} changes object
   */
  detectChanges(oldTracks, newTracks, playlistName = '') {
    const oldMap = new Map(oldTracks.map(t => [this.getTrackKey(t), { ...t, oldPosition: oldTracks.indexOf(t) }]));
    const newMap = new Map(newTracks.map(t => [this.getTrackKey(t), { ...t, newPosition: newTracks.indexOf(t) }]));

    const changes = {
      added: [],
      removed: [],
      moved: [],
      stale: [],
      timestamp: new Date().toISOString(),
      playlistName
    };

    // Detect additions
    newTracks.forEach((track, index) => {
      const key = this.getTrackKey(track);
      if (!oldMap.has(key)) {
        changes.added.push({
          name: track.name,
          artist: track.artist,
          position: index + 1,
          score: track.score || track.performanceScore || 0
        });
      }
    });

    // Detect removals and movements
    oldTracks.forEach((track) => {
      const key = this.getTrackKey(track);
      if (newMap.has(key)) {
        // Track still exists - check if it moved
        const newTrack = newMap.get(key);
        const oldPos = oldTracks.indexOf(track) + 1;
        const newPos = newTrack.newPosition + 1;

        if (oldPos !== newPos) {
          const movement = newPos - oldPos;
          changes.moved.push({
            name: track.name,
            artist: track.artist,
            from: oldPos,
            to: newPos,
            movement: movement > 0 ? `↓${movement}` : `↑${Math.abs(movement)}`,
            direction: movement > 0 ? 'down' : 'up'
          });
        }
      } else {
        // Track removed
        const age = this.getTrackAge(track);
        changes.removed.push({
          name: track.name,
          artist: track.artist,
          reason: age > 2 ? 'stale (>2 days)' : 'dropped',
          age
        });

        if (age > 2) {
          changes.stale.push(track);
        }
      }
    });

    // Find the MINIMUM set of moves using Longest Common Subsequence.
    // Songs in the LCS are already in the right relative order — they don't need moving.
    // Only songs NOT in the LCS need a move instruction.
    // This eliminates reciprocal pairs (e.g. "A→B + B→A" becomes just one move).
    if (changes.moved.length > 0) {
      const survivorOldOrder = oldTracks
        .filter(t => newMap.has(this.getTrackKey(t)))
        .map(t => this.getTrackKey(t));

      const survivorNewOrder = newTracks
        .filter(t => oldMap.has(this.getTrackKey(t)))
        .map(t => this.getTrackKey(t));

      const stableSet = new Set(this._longestCommonSubsequence(survivorOldOrder, survivorNewOrder));

      changes.moved = changes.moved.filter(track => !stableSet.has(this.getTrackKey(track)));
    }

    return changes;
  }

  // Returns the Longest Common Subsequence of two arrays of strings.
  _longestCommonSubsequence(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    const lcs = [];
    let i = m, j = n;
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        lcs.unshift(a[i - 1]);
        i--; j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    return lcs;
  }

  /**
   * Intelligently rank genre tracks from multiple sources
   * 
   * Score based on:
   * - Frequency across sources
   * - Appearance in top positions
   * - Momentum indicators
   * - Viral growth signals
   * 
   * @param {array} mergedTracks - all tracks from all genre sources
   * @param {number} topN - return top N tracks
   * @returns {array} intelligently ranked tracks
   */
  intelligentlyRankGenreTracks(mergedTracks, topN = 50) {
    // Count appearances and calculate frequency score
    const trackScores = new Map();

    mergedTracks.forEach((track) => {
      const key = this.getTrackKey(track);
      
      if (!trackScores.has(key)) {
        trackScores.set(key, {
          ...track,
          appearances: 0,
          totalScore: 0,
          positions: []
        });
      }

      const entry = trackScores.get(key);
      entry.appearances++;
      entry.positions.push(track.position || 0);
      entry.totalScore += (track.score || track.performanceScore || 50) + (track.appearances || 1) * 10;
    });

    // Calculate final ranking score
    const rankedTracks = Array.from(trackScores.values()).map((track) => {
      const frequencyScore = Math.min(track.appearances * 15, 100); // Cross-playlist appearances
      const positionScore = (100 - Math.min(Math.max(...track.positions), 100)); // Average position
      const momentumScore = track.appearances > 2 ? 50 : 0; // Repeated appearances = momentum
      
      const finalScore = (frequencyScore * 0.4) + (positionScore * 0.3) + (momentumScore * 0.3);

      return {
        ...track,
        finalScore,
        ranking: {
          frequency: frequencyScore,
          position: positionScore,
          momentum: momentumScore
        }
      };
    });

    // Sort by score and return top N
    return rankedTracks
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, topN)
      .map((track, index) => ({
        ...track,
        position: index + 1,
        score: track.finalScore
      }));
  }

  /**
   * Identify stale tracks (older than 2 days)
   * @param {array} tracks - playlist tracks
   * @returns {array} stale tracks
   */
  identifyStaleTracks(tracks) {
    return tracks.filter(track => {
      const age = this.getTrackAge(track);
      return age > 2;
    });
  }

  /**
   * Get track age in days
   * @param {object} track - track object
   * @returns {number} age in days
   */
  getTrackAge(track) {
    if (!track.addedAt) return 0;
    
    const added = new Date(track.addedAt);
    const now = new Date();
    const diffMs = now - added;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    return Math.floor(diffDays);
  }

  /**
   * Get unique track key (name + artist)
   * @param {object} track - track object
   * @returns {string} unique key
   */
  getTrackKey(track) {
    return `${(track.name || '').toLowerCase().trim()}_${(track.artist || '').toLowerCase().trim()}`;
  }

  /**
   * Detect momentum tracks (rising in charts)
   * @param {array} oldSnapshot - previous tracks
   * @param {array} newSnapshot - current tracks
   * @returns {array} tracks with strong upward movement
   */
  detectMomentumTracks(oldSnapshot, newSnapshot) {
    const oldMap = new Map(oldSnapshot.map((t, i) => [this.getTrackKey(t), i]));
    const momentum = [];

    newSnapshot.forEach((track, newIndex) => {
      const key = this.getTrackKey(track);
      const oldIndex = oldMap.get(key);

      if (oldIndex !== undefined && oldIndex > newIndex) {
        const jump = oldIndex - newIndex;
        if (jump > 5) {
          momentum.push({
            ...track,
            jumpSize: jump,
            previousPosition: oldIndex + 1,
            currentPosition: newIndex + 1
          });
        }
      }
    });

    return momentum.sort((a, b) => b.jumpSize - a.jumpSize);
  }
}

module.exports = new IntelligenceEngine();
