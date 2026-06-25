"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { downloadJson } from "@/lib/dashboard-helpers";
import { DetailSelection, DailyReport, WeeklyReport } from "@/lib/types";

type DetailDrawerProps = {
  selection: DetailSelection;
  onClose: () => void;
};

export function DetailDrawer({ selection, onClose }: DetailDrawerProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {selection && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/45"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto border-l border-slate-800 bg-background p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Detail Timeline</p>
                <h3 className="text-2xl font-semibold">{selection.report.playlistName}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadJson(`${selection.kind}-${selection.report.playlistName}.json`, selection.report)}
                  className="rounded-xl bg-primary/15 px-3 py-2 text-xs text-primary"
                >
                  Export
                </button>
                <button
                  onClick={() =>
                    router.push(
                      `/compare?dateA=${encodeURIComponent(selection.kind === "daily" ? selection.report.date : "")}&dateB=${encodeURIComponent(selection.kind === "daily" ? selection.report.date : "")}`
                    )
                  }
                  className="rounded-xl bg-secondary/20 px-3 py-2 text-xs text-secondary"
                >
                  Compare
                </button>
                <button onClick={onClose} className="rounded-full bg-card p-2 text-text-secondary hover:text-text-primary">
                  <X size={18} />
                </button>
              </div>
            </div>
            {selection.kind === "daily" ? <DailyBody report={selection.report} /> : <WeeklyBody report={selection.report} />}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function ActionList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl bg-card/85 p-5">
      <h4 className="mb-3 text-lg font-semibold">{title}</h4>
      {items.length === 0 ? (
        <p className="text-sm text-text-secondary">No actions.</p>
      ) : (
        <ul className="space-y-2 text-sm text-text-secondary">
          {items.slice(0, 60).map((item) => (
            <li key={item} className="rounded-xl bg-slate-900/65 px-3 py-2 text-text-primary">
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DailyBody({ report }: { report: DailyReport }) {
  const baseline = report.mode === "baseline";
  const country = report.playlistName.split(" ").at(-1) || "Global";
  const additions = baseline
    ? (report.topTracks || []).map((t) => `ADD #${t.position} ${t.artist} - ${t.name}`)
    : (report.newEntries || []).map((t) => `ADD #${t.position} ${t.artist} - ${t.name}`);
  const moves = (report.movements || []).map((t) => `MOVE ${t.name} from ${t.from} to ${t.to}`);
  const removals = (report.removals || []).map((t) => `REMOVE ${t.artist} - ${t.name}`);

  return (
    <div className="space-y-4">
      <ActionList
        title="Summary"
        items={[
          `Country: ${country}`,
          `Added: ${report.summary.newEntries}`,
          `Removed: ${report.summary.removals}`,
          `Moved: ${report.summary.movements}`,
        ]}
      />
      <ActionList title={baseline ? "Baseline Top 100" : "Additions"} items={additions} />
      <ActionList title="Top Movers" items={moves} />
      <ActionList title="Removals" items={removals} />
      <ActionList
        title="Recommendations"
        items={[
          "Apply additions first in rank order",
          "Review high-movement tracks for playlist momentum",
          "Validate removals before final publish",
        ]}
      />
      <ActionList title="Timeline" items={[`Snapshot Date: ${report.date}`, `Mode: ${report.mode || "delta"}`]} />
    </div>
  );
}

function WeeklyBody({ report }: { report: WeeklyReport }) {
  const baseline = report.mode === "baseline";
  const country = "Genre";
  const additions = baseline
    ? (report.topTracks || []).map((t) => `ADD #${t.position} ${t.artist} - ${t.name}`)
    : (report.hotNewSongs || []).map((t) => `ADD #${t.position} ${t.artist} - ${t.name}`);
  const moves = (report.positionAdjustments || []).map((t) => `MOVE ${t.name} from ${t.from} to ${t.to}`);
  const removals = (report.songsToRemove || []).map((t) => `REMOVE ${t.artist} - ${t.name}`);

  return (
    <div className="space-y-4">
      <ActionList
        title="Summary"
        items={[
          `Country: ${country}`,
          `Added: ${report.summary.newHotSongs}`,
          `Removed: ${report.summary.removedSongs}`,
          `Moved: ${report.summary.positionChanges}`,
        ]}
      />
      <ActionList title={baseline ? "Baseline Top 50" : "Additions"} items={additions} />
      <ActionList title="Top Movers" items={moves} />
      <ActionList title="Removals" items={removals} />
      <ActionList title="Top New Entries" items={additions.slice(0, 10)} />
      <ActionList
        title="Recommendations"
        items={[
          "Apply additions first in exact rank order",
          "Apply movement changes next",
          "Remove stale tracks last",
        ]}
      />
      <ActionList title="Timeline" items={[`Week: ${report.week}`, `Mode: ${report.mode || "delta"}`]} />
    </div>
  );
}
