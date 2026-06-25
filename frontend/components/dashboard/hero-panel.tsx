import { Card } from "@/components/ui/card";

type HeroPanelProps = {
  dailyScans: number;
  weeklyScans: number;
  playlistsTracked: number;
  lastSync: string;
};

export function HeroPanel({ dailyScans, weeklyScans, playlistsTracked, lastSync }: HeroPanelProps) {
  const chips = [
    { label: "Daily Scans", value: dailyScans.toString() },
    { label: "Weekly Scans", value: weeklyScans.toString() },
    { label: "Playlists Tracked", value: playlistsTracked.toString() },
    { label: "Last Sync", value: lastSync },
  ];

  return (
    <Card className="glass-panel rounded-xl3 border border-slate-700/50 p-8 lg:p-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">Playlist Intelligence</h1>
        <p className="max-w-2xl text-base text-text-secondary md:text-lg">
          Monitor chart evolution and update playlists faster.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {chips.map((chip) => (
          <div key={chip.label} className="metric-chip">
            <span className="mr-2 text-xs text-text-secondary">{chip.label}</span>
            <span className="font-semibold text-text-primary">{chip.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
