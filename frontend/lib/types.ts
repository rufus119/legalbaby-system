export type DailyReport = {
  type: "daily";
  playlistName: string;
  date: string;
  timestamp: string;
  baselineRun?: boolean;
  mode?: "baseline" | "delta";
  summary: {
    totalTracks: number;
    newEntries: number;
    removals: number;
    movements: number;
  };
  newEntries?: Array<{ name: string; artist: string; position: number }>;
  removals?: Array<{ name: string; artist: string }>;
  movements?: Array<{ name: string; artist: string; from: string | number; to: string | number }>;
  syncPlan?: Array<{
    type: "SET" | "REMOVE" | "ADD" | "MOVE";
    action: string;
    track: string;
    artist: string;
    position?: number;
    from?: number;
    to?: number;
  }>;
  topTracks?: Array<{ position: number; name: string; artist: string; score?: number }>;
};

export type WeeklyReport = {
  type: "weekly";
  playlistName: string;
  week: string;
  timestamp: string;
  baselineRun?: boolean;
  mode?: "baseline" | "delta";
  summary: {
    totalTracks: number;
    newHotSongs: number;
    removedSongs: number;
    positionChanges: number;
  };
  hotNewSongs?: Array<{ name: string; artist: string; position: number }>;
  songsToRemove?: Array<{ name: string; artist: string }>;
  positionAdjustments?: Array<{ name: string; artist: string; from: string | number; to: string | number }>;
  syncPlan?: Array<{
    type: "SET" | "REMOVE" | "ADD" | "MOVE";
    action: string;
    track: string;
    artist: string;
    position?: number;
    from?: number;
    to?: number;
  }>;
  topTracks?: Array<{ position: number; name: string; artist: string; score?: number }>;
};

export type DashboardStatus = {
  status: string;
  dailyReports: number;
  weeklyReports: number;
  playlistCount: number;
  lastDailyRun: string | null;
  lastWeeklyRun: string | null;
  nextDailyRun: string | null;
  nextWeeklyRun: string | null;
  runningDaily: boolean;
  runningWeekly: boolean;
  resetting?: boolean;
};

export type DateOptions = {
  daily: string[];
  weekly: string[];
};

export type DetailSelection =
  | { kind: "daily"; report: DailyReport }
  | { kind: "weekly"; report: WeeklyReport }
  | null;
