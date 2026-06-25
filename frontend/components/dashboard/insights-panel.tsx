import { PlaylistHealth, PlaylistInsights } from "@/lib/insights-engine";

export function InsightsPanel({
  insights,
  health,
  title = "AI Recommendations",
}: {
  insights: PlaylistInsights[];
  health: PlaylistHealth[];
  title?: string;
}) {
  return (
    <section className="rounded-xl3 bg-card/80 p-5 shadow-card">
      <h3 className="font-display text-xl text-text-primary">{title}</h3>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl bg-surface p-4">
          <p className="text-sm text-text-secondary">Recommended Additions</p>
          <ul className="mt-2 space-y-1 text-sm">
            {insights.flatMap((item) => item.recommendedAdditions).slice(0, 8).map((track, idx) => (
              <li key={`${track.name}-${idx}`} className="rounded-lg bg-background/40 px-3 py-2">
                {track.name} - {track.artist}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-surface p-4">
          <p className="text-sm text-text-secondary">Recommended Removals</p>
          <ul className="mt-2 space-y-1 text-sm">
            {insights.flatMap((item) => item.recommendedRemovals).slice(0, 8).map((track, idx) => (
              <li key={`${track.name}-${idx}`} className="rounded-lg bg-background/40 px-3 py-2">
                {track.name} - {track.artist}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl bg-surface p-4">
          <p className="text-sm text-text-secondary">Songs To Watch</p>
          <ul className="mt-2 space-y-1 text-sm">
            {insights.flatMap((item) => item.songsToWatch).slice(0, 8).map((track, idx) => (
              <li key={`${track.name}-${idx}`} className="rounded-lg bg-background/40 px-3 py-2">
                {track.name} - {track.artist}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-surface p-4">
          <p className="text-sm text-text-secondary">Playlist Health</p>
          <ul className="mt-2 space-y-1 text-sm">
            {health.slice(0, 8).map((item) => (
              <li key={item.playlistName} className="rounded-lg bg-background/40 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span>{item.playlistName}</span>
                  <span className="text-primary">{item.score} ({item.status})</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
