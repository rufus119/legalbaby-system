/**
 * Apple Music Web Scraper with Smart Performance-Based Merging
 * Fetches songs from multiple playlists and intelligently merges them
 * based on performance signals (frequency, consistency, popularity)
 */

const { chromium } = require('playwright');

// Browser instance (lazy-loaded)
let browser = null;

/**
 * Get or create browser instance
 */
async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

/**
 * Scrape Apple Music playlist for songs using Playwright
 * @param {string} playlistUrl - Full URL to Apple Music playlist
 * @param {number} limit - Number of songs to fetch
 * @returns {Array} Array of tracks with {id, name, artist, position, source}
 */
async function scrapePlaylist(playlistUrl, limit = 50) {
  let page = null;
  
  try {
    const playlistName = playlistUrl.split('/').pop().split('?')[0].replace(/-/g, ' ');
    const browserInstance = await getBrowser();
    page = await browserInstance.newPage();
    
    console.log(`    Processing: ${playlistUrl.split('/playlist/')[1]?.split('/')[0] || 'unknown'}`);
    
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Fast load with abort if taking too long
    try {
      await Promise.race([
        page.goto(playlistUrl, { waitUntil: 'domcontentloaded' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 35000))
      ]);
    } catch (e) {
      console.log(`    ⚠ Load timeout, using partial content...`);
      // Try to get whatever is on the page
    }
    
    // Progressive scroll to load more items (critical for Top 100 pages).
    for (let i = 0; i < 9; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
      await page.waitForTimeout(500);
    }
    
    // Extract song data from the page
    const tracks = await page.evaluate((limit) => {
      const songs = [];
      const seen = new Set();
      
      // Try multiple selectors that might contain song info
      const songElements = document.querySelectorAll('[data-testid*="song"], [role="listitem"], li, .song-item');
      
      songElements.forEach((element) => {
        if (songs.length >= limit) return;
        
        try {
          // Try to extract name and artist from various element structures
          let name = null;
          let artist = null;
          
          // Method 1: Look for text content in nested elements
          const links = element.querySelectorAll('a');
          if (links.length >= 2) {
            name = links[0]?.textContent?.trim();
            artist = links[1]?.textContent?.trim();
          }
          
          // Method 2: Check aria-label attributes
          if (!name) {
            const ariaLabel = element.getAttribute('aria-label') || '';
            if (ariaLabel && ariaLabel.includes('by')) {
              const parts = ariaLabel.split(' by ');
              name = parts[0]?.trim();
              artist = parts[1]?.trim();
            }
          }
          
          // Method 3: Look for text nodes
          if (!name) {
            const textContent = element.textContent?.trim() || '';
            const lines = textContent.split('\n').filter(l => l.trim().length > 0);
            if (lines.length >= 2) {
              name = lines[0];
              artist = lines[1];
            }
          }
          
          if (name && artist && name.length > 1 && artist.length > 1 && name !== 'Unknown') {
            const id = `${name}-${artist}`.toLowerCase().replace(/\s+/g, '-');
            if (seen.has(id)) {
              return;
            }
            seen.add(id);
            songs.push({
              id: id,
              name: name,
              artist: artist,
              position: songs.length + 1,
              source: 'apple-music'
            });
          }
        } catch (err) {
          // Skip malformed entries
        }
      });
      
      return songs;
    }, limit);
    
    return tracks;
  } catch (error) {
    console.error(`  ✗ Scraping failed: ${error.message}`);
    return [];
  } finally {
    // Cleanup page
    if (page) {
      try {
        await page.close();
      } catch (e) {}
    }
  }
}

/**
 * Smart Performance Scoring Algorithm
 * Calculates a performance score for each track based on:
 * - Frequency across playlists
 * - Position in playlists (earlier = higher score)
 * - Consistency (appearing in varied playlist types)
 */
function calculatePerformanceScore(track, allSongs, playlistCount) {
  let score = 0;

  // 1. Frequency score: How many playlists does this song appear in?
  const frequency = allSongs.filter(s => s.id === track.id).length;
  const frequencyScore = (frequency / playlistCount) * 40; // 40% weight
  score += frequencyScore;

  // 2. Position score: Earlier positions get higher scores
  // Average position across all appearances
  const positions = allSongs
    .filter(s => s.id === track.id)
    .map(s => s.position);
  const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length;
  const positionScore = Math.max(0, (1 - (avgPosition / 50)) * 30); // 30% weight
  score += positionScore;

  // 3. Consistency score: How consistent is it across playlists?
  const uniquePlaylists = new Set(
    allSongs.filter(s => s.id === track.id).map(s => s.source)
  ).size;
  const consistencyScore = (uniquePlaylists / playlistCount) * 30; // 30% weight
  score += consistencyScore;

  return parseFloat(score.toFixed(2));
}

/**
 * Merge multiple playlists with smart performance-based ranking
 * @param {Array} playlistUrls - Array of playlist URLs
 * @param {number} limit - Number of top songs to return
 * @returns {Array} Top performing songs merged intelligently
 */
async function mergePlaylistsSmartly(playlistUrls, limit = 50) {
  try {
    console.log(`  Scraping ${playlistUrls.length} playlists...`);
    
    // Scrape all playlists
    const allSongs = [];
    for (const url of playlistUrls) {
      const songs = await scrapePlaylist(url, 100); // Scrape more to have better data
      allSongs.push(...songs);
      await new Promise(r => setTimeout(r, 500)); // Rate limiting
    }

    if (allSongs.length === 0) {
      console.log('  ⚠️  No songs found in any playlist');
      return [];
    }

    // Group songs by ID and calculate performance scores
    const songMap = {};
    const uniqueSongIds = new Set(allSongs.map(s => s.id));

    for (const songId of uniqueSongIds) {
      const firstAppearance = allSongs.find(s => s.id === songId);
      const score = calculatePerformanceScore(firstAppearance, allSongs, playlistUrls.length);
      
      songMap[songId] = {
        id: songId,
        name: firstAppearance.name,
        artist: firstAppearance.artist,
        performanceScore: score,
        appearances: allSongs.filter(s => s.id === songId).length,
        playlists: new Set(allSongs.filter(s => s.id === songId).map(s => s.source)).size
      };
    }

    // Sort by performance score and take top N
    const topSongs = Object.values(songMap)
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, limit)
      .map(song => ({
        id: song.id,
        name: song.name,
        artist: song.artist,
        performanceScore: song.performanceScore,
        appearances: song.appearances
      }));

    console.log(`  ✓ Merged ${allSongs.length} songs into top ${topSongs.length}`);
    console.log(`  ✓ Performance analysis complete (${uniqueSongIds.size} unique tracks)`);

    return topSongs;
  } catch (error) {
    console.error(`✗ Failed to merge playlists:`, error.message);
    return [];
  }
}

/**
 * Fetch top songs for a genre using multi-source intelligent merging
 * @param {Array} sources - Array of {name, url} objects
 * @param {number} limit - Number of songs to fetch
 * @returns {Array} Top performing songs
 */
async function fetchTopSongsByGenre(sources, limit = 50) {
  try {
    const urls = sources.map(s => s.url);
    const results = await mergePlaylistsSmartly(urls, limit);
    return results;
  } catch (error) {
    console.error(`✗ Failed to fetch genre songs:`, error.message);
    return [];
  }
}

/**
 * Fetch top songs for a region (single source)
 * @param {Array} sources - Array of {name, url} objects (usually just 1)
 * @param {number} limit - Number of songs to fetch
 * @returns {Array} Top songs
 */
async function fetchTopSongsByRegion(sources, limit = 100) {
  try {
    // For regional, usually just one source, but support multiple
    const urls = sources.map(s => s.url);
    const results = await mergePlaylistsSmartly(urls, limit);
    return results;
  } catch (error) {
    console.error(`✗ Failed to fetch regional songs:`, error.message);
    return [];
  }
}

/**
 * Cleanup browser on process exit
 */
async function cleanup() {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

// Register cleanup on process exit
process.on('exit', () => {
  if (browser) {
    cleanup().catch(console.error);
  }
});

module.exports = {
  fetchTopSongsByGenre,
  fetchTopSongsByRegion,
  scrapePlaylist,
  mergePlaylistsSmartly,
  cleanup
};

