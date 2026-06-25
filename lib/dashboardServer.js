/**
 * Dashboard Server - Lightweight web interface
 * 
 * Serves:
 * - Daily monitoring reports
 * - Weekly analysis reports
 * - Historical snapshots
 * - Dashboard UI
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const snapshotManager = require('./snapshotManager');
const { runDailyUpdate, runWeeklyUpdate } = require('./monitoringEngine');
const { getScheduleTimes } = require('./scheduler');
const { PLAYLISTS } = require('../config');

class DashboardServer {
  constructor() {
    this.isRunningDaily = false;
    this.isRunningWeekly = false;
    this.isResetting = false;
  }

  handleRequest(req, res) {
    const urlObj = new URL(req.url, 'http://localhost');
    const pathname = urlObj.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Handle requests
    if (pathname === '/' || pathname === '/index.html') {
      this.serveHTML(res);
    } else if (pathname === '/api/daily-reports' || pathname === '/api/daily') {
      this.serveDailyReports(res, urlObj.searchParams.get('date'));
    } else if (pathname === '/api/weekly-reports' || pathname === '/api/weekly') {
      this.serveWeeklyReports(res, urlObj.searchParams.get('date'));
    } else if (pathname === '/api/dates') {
      this.serveAvailableDates(res);
    } else if (pathname === '/api/run/daily' && req.method === 'POST') {
      this.runNowDaily(res);
    } else if (pathname === '/api/run/weekly' && req.method === 'POST') {
      this.runNowWeekly(res);
    } else if (pathname === '/api/reset-baseline' && req.method === 'POST') {
      this.runResetBaseline(res);
    } else if (pathname.startsWith('/api/snapshots/')) {
      this.serveSnapshot(req, res);
    } else if (pathname === '/api/playlists') {
      this.servePlaylists(res);
    } else if (pathname === '/api/status') {
      this.serveStatus(res);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  }

  start(port = 3000) {
    const server = http.createServer((req, res) => this.handleRequest(req, res));

    server.listen(port, () => {
      console.log(`\n🌐 Dashboard server running at http://localhost:${port}`);
      console.log('   Open your browser to view reports\n');
    });

    return server;
  }

  getWeekStartIso(dateLike) {
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return null;
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
    return weekStart.toISOString().split('T')[0];
  }

  getReportDate(report, type) {
    if (type === 'daily') {
      if (report.date) return report.date;
      if (report.timestamp) return new Date(report.timestamp).toISOString().split('T')[0];
      return null;
    }

    if (report.week && typeof report.week === 'string') {
      return report.week.split(' ')[0];
    }
    if (report.timestamp) {
      return this.getWeekStartIso(report.timestamp);
    }
    return null;
  }

  loadReportsFromDir(dir, limit, type, filterDate = null) {
    if (!fs.existsSync(dir)) {
      return [];
    }

    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'));

    const reports = [];
    for (const filename of files) {
      try {
        const data = fs.readFileSync(path.join(dir, filename), 'utf8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          reports.push(...parsed);
        } else {
          reports.push(parsed);
        }
      } catch (err) {
        console.error(`Error reading report ${filename}:`, err.message);
      }
    }

    let filtered = reports;
    if (filterDate) {
      filtered = reports.filter((report) => this.getReportDate(report, type) === filterDate);
    }

    filtered.sort((a, b) => {
      const aTime = new Date(a.timestamp || a.date || a.week || 0).getTime();
      const bTime = new Date(b.timestamp || b.date || b.week || 0).getTime();
      return bTime - aTime;
    });

    return filtered.slice(0, limit);
  }

  getNextDailyRunIso() {
    const now = new Date();
    const next = new Date(now);
    next.setUTCHours(0, 0, 0, 0);
    if (next <= now) {
      next.setUTCDate(next.getUTCDate() + 1);
    }
    return next.toISOString();
  }

  getNextWeeklyRunIso() {
    const now = new Date();
    const next = new Date(now);
    next.setUTCHours(0, 0, 0, 0);
    const day = next.getUTCDay();
    const daysUntilSaturday = (6 - day + 7) % 7;
    next.setUTCDate(next.getUTCDate() + daysUntilSaturday);
    if (next <= now) {
      next.setUTCDate(next.getUTCDate() + 7);
    }
    return next.toISOString();
  }

  serveHTML(res) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LegalBaby v4 - Playlist Intelligence Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-0: #06070b;
      --bg-1: #0d1018;
      --bg-2: #131826;
      --card: rgba(19, 24, 38, 0.92);
      --border: rgba(109, 227, 156, 0.25);
      --text: #e9eefc;
      --muted: #9aa8c8;
      --accent: #6de39c;
      --accent-2: #27d3ff;
      --danger: #ff7b7b;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Space Grotesk', sans-serif;
      background:
        radial-gradient(circle at 15% 15%, rgba(39, 211, 255, 0.2), transparent 30%),
        radial-gradient(circle at 85% 10%, rgba(109, 227, 156, 0.18), transparent 35%),
        linear-gradient(160deg, var(--bg-0), var(--bg-1) 42%, #0b1326 100%);
      color: var(--text);
      line-height: 1.5;
      min-height: 100vh;
    }
    .container { max-width: 1250px; margin: 0 auto; padding: 22px; }
    header {
      background: linear-gradient(120deg, rgba(109, 227, 156, 0.16), rgba(39, 211, 255, 0.22));
      border: 1px solid var(--border);
      padding: 30px;
      border-radius: 16px;
      margin-bottom: 24px;
      box-shadow: 0 18px 40px rgba(0,0,0,0.35);
      backdrop-filter: blur(6px);
    }
    header h1 { font-size: 32px; margin-bottom: 8px; letter-spacing: 0.3px; }
    header p { color: var(--muted); font-size: 15px; }
    .section {
      background: var(--card);
      border: 1px solid rgba(154, 168, 200, 0.2);
      border-radius: 14px;
      padding: 20px;
      margin-bottom: 16px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.03);
    }
    .section h2 {
      font-size: 20px;
      margin-bottom: 15px;
      color: var(--accent);
      border-bottom: 1px solid rgba(154, 168, 200, 0.25);
      padding-bottom: 10px;
    }
    .controls-row {
      margin-bottom: 12px;
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
    .controls-row label { font-size: 13px; color: var(--muted); }
    select {
      background: var(--bg-2);
      color: var(--text);
      border: 1px solid rgba(109, 227, 156, 0.35);
      padding: 8px 10px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
    }
    .report-card {
      background: linear-gradient(140deg, rgba(19, 24, 38, 0.98), rgba(13, 16, 24, 0.96));
      border: 1px solid rgba(154, 168, 200, 0.24);
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 10px;
      cursor: pointer;
      transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
    }
    .report-card:hover {
      transform: translateY(-2px);
      border-color: rgba(109, 227, 156, 0.65);
      box-shadow: 0 10px 22px rgba(0, 0, 0, 0.3);
    }
    .report-card h3 { color: var(--accent-2); margin-bottom: 8px; }
    .report-card .meta { font-size: 12px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
    .report-card .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 10px;
      margin-top: 10px;
      font-size: 13px;
    }
    .stat {
      background: rgba(13, 16, 24, 0.8);
      border: 1px solid rgba(154, 168, 200, 0.2);
      padding: 8px;
      border-radius: 8px;
      text-align: center;
    }
    .stat .value { font-weight: 700; color: var(--accent); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
    .empty { color: var(--muted); font-style: italic; padding: 18px; text-align: center; }
    .button-row { display:flex; gap:12px; flex-wrap:wrap; }
    .action-btn {
      padding: 10px 14px;
      background: linear-gradient(120deg, rgba(109, 227, 156, 0.8), rgba(39, 211, 255, 0.85));
      color: #081019;
      border: none;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      cursor: pointer;
    }
    .danger-btn {
      background: linear-gradient(120deg, rgba(255, 123, 123, 0.85), rgba(255, 188, 122, 0.85));
      color: #230606;
    }
    .action-btn:disabled { opacity: 0.55; cursor: not-allowed; }
    #report-details ul { margin: 6px 0 12px 20px; }
    #report-details li { margin-bottom: 4px; color: var(--text); }
    footer {
      border-top: 1px solid rgba(154, 168, 200, 0.2);
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: var(--muted);
      margin-top: 40px;
    }
    @media (max-width: 768px) {
      .container { padding: 14px; }
      header { padding: 20px; }
      header h1 { font-size: 26px; }
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🎵 LegalBaby v4</h1>
      <p>Playlist Intelligence Dashboard - Track changes, movements, and chart evolution</p>
    </header>

    <div class="section">
      <h2>📊 Daily Top 100 Reports</h2>
      <div class="controls-row">
        <label for="daily-date">Date:</label>
        <select id="daily-date" onchange="onDailyDateChange()"></select>
      </div>
      <div id="daily-reports" class="grid">
        <div class="empty">Loading reports...</div>
      </div>
    </div>

    <div class="section">
      <h2>🎯 Weekly Genre Analysis</h2>
      <div class="controls-row">
        <label for="weekly-date">Week:</label>
        <select id="weekly-date" onchange="onWeeklyDateChange()"></select>
      </div>
      <div id="weekly-reports" class="grid">
        <div class="empty">Loading reports...</div>
      </div>
    </div>

    <div class="section">
      <h2>🧾 Selected Report Details</h2>
      <div id="report-details" class="empty">Click a Daily or Weekly card to see exact ADD / REMOVE / MOVE actions.</div>
    </div>

    <div class="section">
      <h2>📈 Status</h2>
      <div id="status" class="empty">Loading...</div>
    </div>

    <div class="section">
      <h2>⚡ Run Now</h2>
      <div class="button-row">
        <button id="run-daily" class="action-btn" onclick="runNow('daily')">Run Daily Now</button>
        <button id="run-weekly" class="action-btn" onclick="runNow('weekly')">Run Weekly Now</button>
        <button id="reset-baseline" class="action-btn danger-btn" onclick="resetBaseline()">Reset Data + Rebuild Baseline</button>
      </div>
      <div id="run-status" class="empty" style="padding:10px 0 0; text-align:left;">Use reset once when starting fresh. It regenerates baseline as ALL ADD actions.</div>
    </div>

    <footer>
      <p>LegalBaby v4 | Playlist Intelligence System | Last updated: <span id="update-time">-</span></p>
    </footer>
  </div>

  <script>
    let selectedDailyDate = null;
    let selectedWeeklyDate = null;
    let dailyReportsCache = [];
    let weeklyReportsCache = [];

    function getWeekStart(dateStr) {
      const d = new Date(dateStr + 'T00:00:00Z');
      const day = d.getUTCDay();
      const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
      return weekStart.toISOString().split('T')[0];
    }

    async function loadAvailableDates() {
      const res = await fetch('/api/dates');
      if (!res.ok) {
        throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
      }

      const data = await res.json();
      const dailySelect = document.getElementById('daily-date');
      const weeklySelect = document.getElementById('weekly-date');

      dailySelect.innerHTML = '';
      weeklySelect.innerHTML = '';

      data.daily.forEach((d) => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        dailySelect.appendChild(opt);
      });

      data.weekly.forEach((d) => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        weeklySelect.appendChild(opt);
      });

      const today = new Date().toISOString().split('T')[0];
      const thisWeek = getWeekStart(today);
      selectedDailyDate = data.daily.includes(today) ? today : (data.daily[0] || null);
      selectedWeeklyDate = data.weekly.includes(thisWeek) ? thisWeek : (data.weekly[0] || null);

      if (selectedDailyDate) dailySelect.value = selectedDailyDate;
      if (selectedWeeklyDate) weeklySelect.value = selectedWeeklyDate;
    }

    async function onDailyDateChange() {
      selectedDailyDate = document.getElementById('daily-date').value;
      await loadDailyReports();
    }

    async function onWeeklyDateChange() {
      selectedWeeklyDate = document.getElementById('weekly-date').value;
      await loadWeeklyReports();
    }

    async function loadDailyReports() {
      try {
        const query = selectedDailyDate ? ('?date=' + encodeURIComponent(selectedDailyDate)) : '';
        const res = await fetch('/api/daily' + query);
        if (!res.ok) {
          throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
        }
        const reports = await res.json();
        dailyReportsCache = reports;
        const container = document.getElementById('daily-reports');

        if (reports.length === 0) {
          container.innerHTML = '<div class="empty">No daily reports yet</div>';
          return;
        }

        container.innerHTML = reports.map((r, idx) => \`
          <div class="report-card" onclick="showReportDetails('daily', \${idx})">
            <h3>\${r.playlistName}</h3>
            <div class="meta">\${r.date} | \${r.summary.totalTracks} tracks</div>
            <div class="stats">
              <div class="stat">
                <div>New</div>
                <div class="value">\${r.summary.newEntries}</div>
              </div>
              <div class="stat">
                <div>Removed</div>
                <div class="value">\${r.summary.removals}</div>
              </div>
              <div class="stat">
                <div>Moved</div>
                <div class="value">\${r.summary.movements}</div>
              </div>
            </div>
          </div>
        \`).join('');
      } catch (error) {
        console.error('Daily reports error:', error);
        const errorMsg = error.message || 'Unknown error';
        document.getElementById('daily-reports').innerHTML = \`<div class="empty">❌ Error: \${errorMsg}</div>\`;
      }
    }

    async function runNow(type) {
      const status = document.getElementById('run-status');
      const buttonId = type === 'daily' ? 'run-daily' : 'run-weekly';
      const btn = document.getElementById(buttonId);
      try {
        btn.disabled = true;
        status.innerHTML = 'Running ' + type + ' update...';
        const res = await fetch('/api/run/' + type, { method: 'POST' });
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || ('HTTP ' + res.status));
        }
        status.innerHTML = '✅ ' + result.message;
        await loadAvailableDates();
        await loadDailyReports();
        await loadWeeklyReports();
        await loadStatus();
      } catch (error) {
        status.innerHTML = '❌ Error: ' + (error.message || 'Unknown error');
      } finally {
        btn.disabled = false;
      }
    }

    async function resetBaseline() {
      const status = document.getElementById('run-status');
      const btn = document.getElementById('reset-baseline');

      const confirmed = confirm('This deletes all saved daily/weekly reports and snapshots, then rebuilds fresh baselines. Continue?');
      if (!confirmed) {
        return;
      }

      try {
        btn.disabled = true;
        status.innerHTML = 'Resetting data and rebuilding clean baseline... this can take a few minutes.';
        const res = await fetch('/api/reset-baseline', { method: 'POST' });
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || ('HTTP ' + res.status));
        }

        status.innerHTML = '✅ ' + result.message;
        await loadAvailableDates();
        await loadDailyReports();
        await loadWeeklyReports();
        await loadStatus();
      } catch (error) {
        status.innerHTML = '❌ Error: ' + (error.message || 'Unknown error');
      } finally {
        btn.disabled = false;
      }
    }

    async function loadWeeklyReports() {
      try {
        const query = selectedWeeklyDate ? ('?date=' + encodeURIComponent(selectedWeeklyDate)) : '';
        const res = await fetch('/api/weekly' + query);
        if (!res.ok) {
          throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
        }
        const reports = await res.json();
        weeklyReportsCache = reports;
        const container = document.getElementById('weekly-reports');

        if (reports.length === 0) {
          container.innerHTML = '<div class="empty">No weekly reports yet</div>';
          return;
        }

        container.innerHTML = reports.map((r, idx) => \`
          <div class="report-card" onclick="showReportDetails('weekly', \${idx})">
            <h3>\${r.playlistName}</h3>
            <div class="meta">\${r.week}</div>
            <div class="stats">
              <div class="stat">
                <div>Hot New</div>
                <div class="value">\${r.summary.newHotSongs}</div>
              </div>
              <div class="stat">
                <div>Remove</div>
                <div class="value">\${r.summary.removedSongs}</div>
              </div>
              <div class="stat">
                <div>Reorder</div>
                <div class="value">\${r.summary.positionChanges}</div>
              </div>
            </div>
          </div>
        \`).join('');
      } catch (error) {
        console.error('Weekly reports error:', error);
        const errorMsg = error.message || 'Unknown error';
        document.getElementById('weekly-reports').innerHTML = \`<div class="empty">❌ Error: \${errorMsg}</div>\`;
      }
    }

    function showReportDetails(type, idx) {
      const details = document.getElementById('report-details');
      const report = type === 'daily' ? dailyReportsCache[idx] : weeklyReportsCache[idx];
      if (!report) {
        details.innerHTML = '<div class="empty">No details found for selected report.</div>';
        return;
      }

      const section = (title, items) => {
        if (!items || items.length === 0) return '<p><strong>' + title + ':</strong> None</p>';
        return '<p><strong>' + title + ':</strong></p><ul>' + items.join('') + '</ul>';
      };

      if (type === 'daily') {
        const isBaseline = report.mode === 'baseline' || report.baselineRun === true;

        if (isBaseline) {
          const top100 = (report.topTracks || report.newEntries || []).slice(0, 100)
            .map((t, i) => '<li>ADD: #' + (t.position || i + 1) + ' ' + t.name + ' - ' + t.artist + '</li>');

          details.innerHTML =
            '<div>' +
            '<p><strong>' + report.playlistName + '</strong> | ' + (report.date || '') + '</p>' +
            '<p><strong>Baseline Top 100 (Clean Start):</strong> add all tracks below.</p>' +
            '<ul>' + top100.join('') + '</ul>' +
            '</div>';
          return;
        }

        const addItems = (report.newEntries || []).slice(0, 25).map((t) => '<li>ADD: #' + t.position + ' ' + t.name + ' - ' + t.artist + '</li>');
        const removeItems = (report.removals || []).slice(0, 25).map((t) => '<li>REMOVE: ' + t.name + ' - ' + t.artist + '</li>');
        const moveItems = (report.movements || []).slice(0, 25).map((t) => '<li>MOVE: ' + t.name + ' (' + t.from + ' → ' + t.to + ')</li>');

        details.innerHTML =
          '<div>' +
          '<p><strong>' + report.playlistName + '</strong> | ' + (report.date || '') + '</p>' +
          '<p style="color:#9aa8c8;">Delta view: concise manual actions only.</p>' +
          section('ADD', addItems) +
          section('REMOVE', removeItems) +
          section('MOVE', moveItems) +
          '</div>';
        return;
      }

      const isBaseline = report.mode === 'baseline' || report.baselineRun === true;
      if (isBaseline) {
        const top50 = (report.topTracks || report.topNewSongs || []).slice(0, 50)
          .map((t, i) => '<li>#' + (t.position || i + 1) + ' ' + t.name + ' - ' + t.artist + '</li>');
        details.innerHTML =
          '<div>' +
          '<p><strong>' + report.playlistName + '</strong> | ' + (report.week || '') + '</p>' +
          '<p><strong>Initial Top 50 Seed List</strong> (Use this to populate Spotify now)</p>' +
          '<ul>' + top50.join('') + '</ul>' +
          '</div>';
        return;
      }

      const addItems = (report.hotNewSongs || []).slice(0, 30).map((t) => '<li>ADD: #' + t.position + ' ' + t.name + ' - ' + t.artist + '</li>');
      const removeItems = (report.songsToRemove || []).slice(0, 25).map((t) => '<li>REMOVE: ' + t.name + ' - ' + t.artist + '</li>');
      const moveItems = (report.positionAdjustments || []).slice(0, 25).map((t) => '<li>MOVE: ' + t.name + ' (' + t.from + ' → ' + t.to + ')</li>');

      details.innerHTML =
        '<div>' +
        '<p><strong>' + report.playlistName + '</strong> | ' + (report.week || '') + '</p>' +
        '<p style="color:#9aa8c8;">Delta view: concise manual actions only.</p>' +
        section('ADD', addItems) +
        section('REMOVE', removeItems) +
        section('MOVE', moveItems) +
        '</div>';
    }

    async function loadStatus() {
      try {
        const res = await fetch('/api/status');
        if (!res.ok) {
          throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
        }
        const status = await res.json();
        
        const formatTime = (iso) => {
          if (!iso) return 'Never';
          return new Date(iso).toLocaleString();
        };
        
        document.getElementById('status').innerHTML = 
          '<div>' +
          '<p><strong>🟢 Status:</strong> ' + status.status + '</p>' +
          '<p><strong>📊 Daily Reports:</strong> ' + status.dailyReports + ' | <strong>Weekly Reports:</strong> ' + status.weeklyReports + '</p>' +
          '<p><strong>📅 Last Daily Run:</strong> ' + formatTime(status.lastDailyRun) + '</p>' +
          '<p><strong>📅 Last Weekly Run:</strong> ' + formatTime(status.lastWeeklyRun) + '</p>' +
          '<p><strong>⏰ Next Daily Run:</strong> ' + formatTime(status.nextDailyRun) + '</p>' +
          '<p><strong>⏰ Next Weekly Run:</strong> ' + formatTime(status.nextWeeklyRun) + '</p>' +
          '<p><strong>🎵 Monitored Playlists:</strong> ' + status.playlistCount + '</p>' +
          '</div>';
      } catch (error) {
        console.error('Status error:', error);
        const errorMsg = error.message || 'Unknown error';
        document.getElementById('status').innerHTML = '<div class="empty">❌ Error: ' + errorMsg + '</div>';
      }
    }

    // Load all on page load (current date/week by default)
    async function initDashboard() {
      try {
        await loadAvailableDates();
      } catch (error) {
        console.error('Date initialization error:', error);
      }
      await loadDailyReports();
      await loadWeeklyReports();
      await loadStatus();
    }

    initDashboard();

    // Update time
    document.getElementById('update-time').textContent = new Date().toLocaleString();
  </script>
</body>
</html>
    `;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  serveDailyReports(res, date = null) {
    try {
      const dir = 'data/reports/daily';
      const reports = this.loadReportsFromDir(dir, 30, 'daily', date);
      res.end(JSON.stringify(reports));
    } catch (error) {
      console.error('Daily reports error:', error.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  serveWeeklyReports(res, date = null) {
    try {
      const dir = 'data/reports/weekly';
      const reports = this.loadReportsFromDir(dir, 52, 'weekly', date);
      res.end(JSON.stringify(reports));
    } catch (error) {
      console.error('Weekly reports error:', error.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  serveAvailableDates(res) {
    try {
      const daily = this.loadReportsFromDir('data/reports/daily', 365, 'daily')
        .map((r) => this.getReportDate(r, 'daily'))
        .filter(Boolean);

      const weekly = this.loadReportsFromDir('data/reports/weekly', 365, 'weekly')
        .map((r) => this.getReportDate(r, 'weekly'))
        .filter(Boolean);

      const uniqSortDesc = (arr) => [...new Set(arr)].sort().reverse();

      res.end(JSON.stringify({
        daily: uniqSortDesc(daily).slice(0, 30),
        weekly: uniqSortDesc(weekly).slice(0, 30)
      }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  serveSnapshot(req, res) {
    // Parse snapshot request: /api/snapshots/type/trackingKey
    const parts = req.url.split('/').filter(p => p);
    if (parts.length < 4) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Invalid snapshot request' }));
      return;
    }

    const type = parts[2];
    const trackingKey = parts[3];

    try {
      const history = snapshotManager.getSnapshotHistory(type, trackingKey, 20);
      res.end(JSON.stringify(history));
    } catch (error) {
      res.end(JSON.stringify([]));
    }
  }

  servePlaylists(res) {
    const playlists = {
      daily: (PLAYLISTS.top100 || []).map(p => ({ name: p.name, key: p.trackingKey })),
      weekly: (PLAYLISTS.genres || []).map(p => ({ name: p.name, key: p.trackingKey }))
    };
    res.end(JSON.stringify(playlists));
  }

  serveStatus(res) {
    try {
      let lastDailyRun = null;
      let lastWeeklyRun = null;
      
      // Get last daily report timestamp
      const dailyDir = 'data/reports/daily';
      if (fs.existsSync(dailyDir)) {
        const files = fs.readdirSync(dailyDir)
          .filter(f => f.endsWith('.json'))
          .sort()
          .reverse();
        
        if (files.length > 0) {
          try {
            const data = fs.readFileSync(path.join(dailyDir, files[0]), 'utf8');
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed[0]) {
              lastDailyRun = parsed[0].timestamp;
            } else if (parsed.timestamp) {
              lastDailyRun = parsed.timestamp;
            }
          } catch (e) {
            console.error('Error reading daily report:', e.message);
          }
        }
      }
      
      // Get last weekly report timestamp
      const weeklyDir = 'data/reports/weekly';
      if (fs.existsSync(weeklyDir)) {
        const files = fs.readdirSync(weeklyDir)
          .filter(f => f.endsWith('.json'))
          .sort()
          .reverse();
        
        if (files.length > 0) {
          try {
            const data = fs.readFileSync(path.join(weeklyDir, files[0]), 'utf8');
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed[0]) {
              lastWeeklyRun = parsed[0].timestamp;
            } else if (parsed.timestamp) {
              lastWeeklyRun = parsed.timestamp;
            }
          } catch (e) {
            console.error('Error reading weekly report:', e.message);
          }
        }
      }
      
      const scheduleTimes = getScheduleTimes();

      res.end(JSON.stringify({
        status: 'running',
        version: 'v4',
        playlistCount: ((PLAYLISTS.top100 || []).length + (PLAYLISTS.genres || []).length),
        lastDailyRun: lastDailyRun,
        lastWeeklyRun: lastWeeklyRun,
        dailyReports: fs.existsSync(dailyDir) ? fs.readdirSync(dailyDir).filter(f => f.endsWith('.json')).length : 0,
        weeklyReports: fs.existsSync(weeklyDir) ? fs.readdirSync(weeklyDir).filter(f => f.endsWith('.json')).length : 0,
        nextDailyRun: scheduleTimes.daily ? scheduleTimes.daily.toISOString() : this.getNextDailyRunIso(),
        nextWeeklyRun: scheduleTimes.weekly ? scheduleTimes.weekly.toISOString() : this.getNextWeeklyRunIso(),
        runningDaily: this.isRunningDaily,
        runningWeekly: this.isRunningWeekly,
        resetting: this.isResetting
      }));
    } catch (error) {
      console.error('Status error:', error.message);
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  async runNowDaily(res) {
    if (this.isRunningDaily) {
      res.writeHead(409);
      res.end(JSON.stringify({ error: 'Daily update is already running' }));
      return;
    }

    this.isRunningDaily = true;
    try {
      const reports = await runDailyUpdate();
      res.end(JSON.stringify({
        ok: true,
        message: `Daily update complete (${reports.length} reports)`
      }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    } finally {
      this.isRunningDaily = false;
    }
  }

  async runNowWeekly(res) {
    if (this.isRunningWeekly) {
      res.writeHead(409);
      res.end(JSON.stringify({ error: 'Weekly update is already running' }));
      return;
    }

    this.isRunningWeekly = true;
    try {
      const reports = await runWeeklyUpdate();
      res.end(JSON.stringify({
        ok: true,
        message: `Weekly update complete (${reports.length} reports)`
      }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    } finally {
      this.isRunningWeekly = false;
    }
  }

  async runResetBaseline(res) {
    if (this.isRunningDaily || this.isRunningWeekly || this.isResetting) {
      res.writeHead(409);
      res.end(JSON.stringify({ error: 'Another update is currently running' }));
      return;
    }

    this.isResetting = true;
    try {
      const deleted = snapshotManager.resetAllData();
      this.isRunningDaily = true;
      const dailyReports = await runDailyUpdate(true);
      this.isRunningDaily = false;

      this.isRunningWeekly = true;
      const weeklyReports = await runWeeklyUpdate(true);
      this.isRunningWeekly = false;

      res.end(JSON.stringify({
        ok: true,
        message: 'Clean slate completed. Baseline daily and weekly reports regenerated.',
        deleted,
        dailyReports: dailyReports.length,
        weeklyReports: weeklyReports.length
      }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    } finally {
      this.isRunningDaily = false;
      this.isRunningWeekly = false;
      this.isResetting = false;
    }
  }
}

module.exports = new DashboardServer();
