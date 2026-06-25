import { Card } from "@/components/ui/card";

type HeroPanelProps = {
  countriesMonitored: number;
  playlistsActive: number;
  tracksTracked: number;
  latestSnapshot: string;
};

export function HeroPanel({ countriesMonitored, playlistsActive, tracksTracked, latestSnapshot }: HeroPanelProps) {
  const chips = [
    { label: "Countries", value: countriesMonitored.toString() },
    { label: "Playlists", value: playlistsActive.toString() },
    { label: "Tracks", value: tracksTracked.toString() },
    { label: "Last Snapshot", value: latestSnapshot },
  ];

  return (
    <Card className="glass-panel rounded-xl3 border border-slate-700/50 p-5 md:p-8 lg:p-10">
      <div className="space-y-2 md:space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary md:text-5xl">Your Playlist Control Center</h1>
        <p className="max-w-2xl text-sm text-text-secondary md:text-lg">
          Monitor movement, discover opportunities, update faster.
        </p>
      </div>

      <div className="mobile-swipe mt-4 md:mt-8">
        <div className="flex min-w-max gap-3 pb-1">
        {chips.map((chip) => (
          <div key={chip.label} className="metric-chip flex h-[72px] min-w-[180px] items-center justify-between md:hover:-translate-y-1">
            <span className="text-xs text-text-secondary">{chip.label}</span>
            <span className="text-sm font-semibold text-text-primary">{chip.value}</span>
          </div>
        ))}
        </div>
      </div>
    </Card>
  );
}
