import { DailyReport, WeeklyReport } from "@/lib/types";

export function countryFromPlaylist(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("uk")) return "🇬🇧";
  if (lower.includes("us")) return "🇺🇸";
  if (lower.includes("global")) return "🌍";
  if (lower.includes("ghana")) return "🇬🇭";
  if (lower.includes("nigeria")) return "🇳🇬";
  return "🎧";
}

export function summarizeTracks(daily: DailyReport[], weekly: WeeklyReport[]) {
  const dailyTracks = daily.reduce((sum, report) => sum + (report.summary?.totalTracks || 0), 0);
  const weeklyTracks = weekly.reduce((sum, report) => sum + (report.summary?.totalTracks || 0), 0);
  return dailyTracks + weeklyTracks;
}

export function safeDate(value: string) {
  if (!value) return "-";
  return value;
}
