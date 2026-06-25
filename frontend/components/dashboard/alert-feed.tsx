import { AlertItem } from "@/lib/insights-engine";

export function AlertFeed({ alerts, title = "Smart Alerts" }: { alerts: AlertItem[]; title?: string }) {
  return (
    <section className="rounded-xl3 bg-card/80 p-5 shadow-card">
      <h3 className="font-display text-xl text-text-primary">{title}</h3>
      <ul className="mt-3 space-y-2">
        {alerts.length ? (
          alerts.slice(0, 12).map((alert) => (
            <li key={alert.id} className="rounded-xl bg-surface px-3 py-2 text-sm">
              <p className="text-text-primary">{alert.message}</p>
              <p className="text-xs text-text-secondary">{alert.playlistName}</p>
            </li>
          ))
        ) : (
          <li className="rounded-xl bg-surface px-3 py-2 text-sm text-text-secondary">No smart alerts at this moment.</li>
        )}
      </ul>
    </section>
  );
}
