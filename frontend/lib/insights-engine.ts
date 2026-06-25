import { DailyReport, WeeklyReport } from "@/lib/types";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertItem = {
  id: string;
  playlistName: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
};

export type HealthStatus = "Excellent" | "Healthy" | "Average" | "Needs Attention";

export type PlaylistHealth = {
  playlistName: string;
  score: number;
  status: HealthStatus;
  freshness: number;
  momentum: number;
  diversity: number;
  recentUpdates: number;
};

export type RecommendationTrack = {
  name: string;
  artist: string;
  score: number;
  reason: string;
};

export type PlaylistInsights = {
  playlistName: string;
  frequencyScore: number;
  momentumScore: number;
  consistencyScore: number;
  crossPlaylistPresence: number;
  recommendedAdditions: RecommendationTrack[];
  recommendedRemovals: RecommendationTrack[];
  songsToWatch: RecommendationTrack[];
};

type TrackAggregate = {
  key: string;
  name: string;
  artist: string;
  frequency: number;
  momentum: number;
  consistency: number;
  playlists: Set<string>;
  removedCount: number;
  seenInTop: number;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value: number, max: number) {
  if (max <= 0) return 0;
  return clamp(Math.round((value / max) * 100));
}

function trackKey(name: string, artist: string) {
  return `${name.toLowerCase()}|${artist.toLowerCase()}`;
}

function ensureTrack(map: Map<string, TrackAggregate>, name: string, artist: string) {
  const key = trackKey(name, artist);
  if (!map.has(key)) {
    map.set(key, {
      key,
      name,
      artist,
      frequency: 0,
      momentum: 0,
      consistency: 0,
      playlists: new Set<string>(),
      removedCount: 0,
      seenInTop: 0,
    });
  }
  return map.get(key)!;
}

export function buildInsights(dailyReports: DailyReport[], weeklyReports: WeeklyReport[]) {
  const trackMap = new Map<string, TrackAggregate>();

  for (const report of dailyReports) {
    const playlist = report.playlistName;

    for (const track of report.newEntries || []) {
      const item = ensureTrack(trackMap, track.name, track.artist);
      item.frequency += 2;
      item.momentum += 4;
      item.consistency += 1;
      item.playlists.add(playlist);
    }

    for (const track of report.movements || []) {
      const item = ensureTrack(trackMap, track.name, "Unknown Artist");
      const from = Number(track.from);
      const to = Number(track.to);
      const climb = Number.isFinite(from) && Number.isFinite(to) ? Math.max(0, from - to) : 0;
      item.frequency += 1;
      item.momentum += 2 + Math.round(climb / 5);
      item.consistency += 2;
      item.playlists.add(playlist);
    }

    for (const track of report.removals || []) {
      const item = ensureTrack(trackMap, track.name, track.artist);
      item.removedCount += 1;
      item.momentum -= 2;
      item.playlists.add(playlist);
    }

    for (const track of report.topTracks || []) {
      const item = ensureTrack(trackMap, track.name, track.artist);
      item.frequency += 1;
      item.consistency += Math.max(1, 8 - Math.floor(track.position / 15));
      item.seenInTop += 1;
      item.playlists.add(playlist);
    }
  }

  for (const report of weeklyReports) {
    const playlist = report.playlistName;

    for (const track of report.hotNewSongs || []) {
      const item = ensureTrack(trackMap, track.name, track.artist);
      item.frequency += 2;
      item.momentum += 3;
      item.consistency += 1;
      item.playlists.add(playlist);
    }

    for (const track of report.positionAdjustments || []) {
      const item = ensureTrack(trackMap, track.name, "Unknown Artist");
      const from = Number(track.from);
      const to = Number(track.to);
      const climb = Number.isFinite(from) && Number.isFinite(to) ? Math.max(0, from - to) : 0;
      item.frequency += 1;
      item.momentum += 2 + Math.round(climb / 6);
      item.consistency += 2;
      item.playlists.add(playlist);
    }

    for (const track of report.songsToRemove || []) {
      const item = ensureTrack(trackMap, track.name, track.artist);
      item.removedCount += 1;
      item.momentum -= 2;
      item.playlists.add(playlist);
    }

    for (const track of report.topTracks || []) {
      const item = ensureTrack(trackMap, track.name, track.artist);
      item.frequency += 1;
      item.consistency += Math.max(1, 6 - Math.floor(track.position / 10));
      item.seenInTop += 1;
      item.playlists.add(playlist);
    }
  }

  const tracks = Array.from(trackMap.values());
  const maxFrequency = Math.max(...tracks.map((track) => track.frequency), 1);
  const maxMomentum = Math.max(...tracks.map((track) => track.momentum), 1);
  const maxConsistency = Math.max(...tracks.map((track) => track.consistency), 1);

  const allPlaylists = new Set<string>([
    ...dailyReports.map((report) => report.playlistName),
    ...weeklyReports.map((report) => report.playlistName),
  ]);

  const healthByPlaylist = new Map<string, PlaylistHealth>();
  const insightsByPlaylist = new Map<string, PlaylistInsights>();

  for (const playlistName of Array.from(allPlaylists)) {
    const relatedTracks = tracks.filter((track) => track.playlists.has(playlistName));
    const additions = relatedTracks
      .filter((track) => track.removedCount === 0)
      .sort((a, b) => b.momentum - a.momentum)
      .slice(0, 8)
      .map((track) => ({
        name: track.name,
        artist: track.artist,
        score: normalize(track.momentum + track.frequency, maxMomentum + maxFrequency),
        reason: "Rising momentum across monitored charts",
      }));

    const removals = relatedTracks
      .filter((track) => track.removedCount > 0)
      .sort((a, b) => b.removedCount - a.removedCount)
      .slice(0, 8)
      .map((track) => ({
        name: track.name,
        artist: track.artist,
        score: clamp(track.removedCount * 20),
        reason: "Repeated removals detected",
      }));

    const watch = relatedTracks
      .filter((track) => track.playlists.size >= 2)
      .sort((a, b) => b.playlists.size - a.playlists.size || b.frequency - a.frequency)
      .slice(0, 8)
      .map((track) => ({
        name: track.name,
        artist: track.artist,
        score: clamp(track.playlists.size * 20 + track.consistency),
        reason: "Appearing across multiple playlists",
      }));

    const avgFrequency = relatedTracks.length
      ? relatedTracks.reduce((sum, track) => sum + normalize(track.frequency, maxFrequency), 0) / relatedTracks.length
      : 0;
    const avgMomentum = relatedTracks.length
      ? relatedTracks.reduce((sum, track) => sum + normalize(track.momentum, maxMomentum), 0) / relatedTracks.length
      : 0;
    const avgConsistency = relatedTracks.length
      ? relatedTracks.reduce((sum, track) => sum + normalize(track.consistency, maxConsistency), 0) / relatedTracks.length
      : 0;
    const avgCrossPresence = relatedTracks.length
      ? relatedTracks.reduce((sum, track) => sum + track.playlists.size, 0) / relatedTracks.length
      : 0;

    insightsByPlaylist.set(playlistName, {
      playlistName,
      frequencyScore: Math.round(avgFrequency),
      momentumScore: Math.round(avgMomentum),
      consistencyScore: Math.round(avgConsistency),
      crossPlaylistPresence: Math.round(avgCrossPresence),
      recommendedAdditions: additions,
      recommendedRemovals: removals,
      songsToWatch: watch,
    });

    const freshness = clamp((additions.length * 12) - removals.length * 4 + avgFrequency * 0.35);
    const momentum = clamp(avgMomentum * 0.8 + watch.length * 3);
    const diversity = clamp(new Set(relatedTracks.map((track) => track.artist)).size * 8);
    const recentUpdates = clamp((relatedTracks.length > 0 ? 40 : 0) + additions.length * 4 + watch.length * 2);

    const score = clamp(Math.round(freshness * 0.3 + momentum * 0.3 + diversity * 0.2 + recentUpdates * 0.2));

    const status: HealthStatus =
      score >= 85 ? "Excellent" : score >= 70 ? "Healthy" : score >= 50 ? "Average" : "Needs Attention";

    healthByPlaylist.set(playlistName, {
      playlistName,
      score,
      status,
      freshness: Math.round(freshness),
      momentum: Math.round(momentum),
      diversity: Math.round(diversity),
      recentUpdates: Math.round(recentUpdates),
    });
  }

  const alerts: AlertItem[] = [];

  for (const report of dailyReports) {
    for (const track of report.newEntries || []) {
      alerts.push({
        id: `${report.playlistName}-new-${trackKey(track.name, track.artist)}`,
        playlistName: report.playlistName,
        message: `New entry detected: ${track.name} - ${track.artist}`,
        severity: "info",
        timestamp: report.timestamp,
      });
    }

    for (const track of report.movements || []) {
      const from = Number(track.from);
      const to = Number(track.to);
      const climb = Number.isFinite(from) && Number.isFinite(to) ? from - to : 0;
      if (climb > 20) {
        alerts.push({
          id: `${report.playlistName}-rise-${track.name}`,
          playlistName: report.playlistName,
          message: `${track.name} climbed ${climb} positions`,
          severity: "warning",
          timestamp: report.timestamp,
        });
      }
    }

    for (const track of report.removals || []) {
      alerts.push({
        id: `${report.playlistName}-removed-${trackKey(track.name, track.artist)}`,
        playlistName: report.playlistName,
        message: `Removed from monitored chart: ${track.name} - ${track.artist}`,
        severity: "critical",
        timestamp: report.timestamp,
      });
    }
  }

  for (const track of tracks) {
    if (track.playlists.size >= 2) {
      alerts.push({
        id: `cross-${track.key}`,
        playlistName: "Cross Playlist",
        message: `${track.name} entered ${track.playlists.size} playlists`,
        severity: "warning",
        timestamp: new Date().toISOString(),
      });
    }
  }

  const dedupedAlerts = Array.from(new Map(alerts.map((alert) => [alert.id, alert])).values())
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 50);

  return {
    insightsByPlaylist,
    healthByPlaylist,
    alerts: dedupedAlerts,
    allInsights: Array.from(insightsByPlaylist.values()),
    allHealth: Array.from(healthByPlaylist.values()).sort((a, b) => b.score - a.score),
  };
}
