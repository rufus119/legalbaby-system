import { Card } from "@/components/ui/card";

type HeroPanelProps = {
  countriesMonitored: number;
  playlistsActive: number;
  tracksTracked: number;
  latestSnapshot: string;
};

export function HeroPanel({ countriesMonitored, playlistsActive, tracksTracked, latestSnapshot }: HeroPanelProps) {
  const chips = [
    { label: "Countries Monitored", value: countriesMonitored.toString() },
    { label: "Playlists Active", value: playlistsActive.toString() },
    { label: "Tracks Tracked", value: tracksTracked.toString() },
    { label: "Latest Snapshot", value: latestSnapshot },
  ];

  return (
    <Card className="glass-panel rounded-xl3 border border-slate-700/50 p-8 lg:p-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">Your Playlist Control Center</h1>
        <p className="max-w-2xl text-base text-text-secondary md:text-lg">
          Monitor movement, discover opportunities, update faster.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {chips.map((chip) => (
          <div key={chip.label} className="metric-chip transition-transform duration-200 hover:-translate-y-1">
            <span className="mr-2 text-xs text-text-secondary">{chip.label}</span>
            <span className="font-semibold text-text-primary">{chip.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
