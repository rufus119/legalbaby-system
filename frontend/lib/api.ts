import { DashboardStatus, DailyReport, DateOptions, WeeklyReport } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

export function getDates() {
  return fetchJson<DateOptions>("/api/dates");
}

export function getDaily(date?: string) {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return fetchJson<DailyReport[]>(`/api/daily${query}`);
}

export function getWeekly(date?: string) {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return fetchJson<WeeklyReport[]>(`/api/weekly${query}`);
}

export function getStatus() {
  return fetchJson<DashboardStatus>("/api/status");
}

export async function runNow(type: "daily" | "weekly") {
  const res = await fetch(`${API_BASE}/api/run/${type}`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

export async function resetBaseline() {
  const res = await fetch(`${API_BASE}/api/reset-baseline`, { method: "POST" });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}
