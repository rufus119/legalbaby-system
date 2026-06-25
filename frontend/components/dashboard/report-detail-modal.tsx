"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { DailyReport, WeeklyReport } from "@/lib/types";

type ReportDetailModalProps = {
  report: DailyReport | WeeklyReport | null;
  type: "daily" | "weekly" | null;
  onClose: () => void;
};

export function ReportDetailModal({ report, type, onClose }: ReportDetailModalProps) {
  const entries =
    type === "daily"
      ? (report as DailyReport | null)?.newEntries || []
      : (report as WeeklyReport | null)?.hotNewSongs || [];

  const removals =
    type === "daily"
      ? (report as DailyReport | null)?.removals || []
      : (report as WeeklyReport | null)?.songsToRemove || [];

  const moves =
    type === "daily"
      ? (report as DailyReport | null)?.movements || []
      : (report as WeeklyReport | null)?.positionAdjustments || [];

  return (
    <AnimatePresence>
      {report ? (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            aria-label="Close details"
          />

          <motion.aside
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-4 bottom-4 z-50 mx-auto w-full max-w-3xl rounded-xl3 border border-white/10 bg-surface/95 p-5 shadow-glass sm:inset-x-8 sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
                  {type === "daily" ? "Daily Playlist Details" : "Weekly Genre Details"}
                </p>
                <h3 className="mt-2 font-display text-2xl text-text-primary">{report.playlistName}</h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-white/10 p-2 text-text-secondary transition hover:border-white/20 hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <DetailColumn title="Added" items={entries.map((item) => `${item.name} - ${item.artist}`)} empty="No additions" />
              <DetailColumn title="Removed" items={removals.map((item) => `${item.name} - ${item.artist}`)} empty="No removals" />
              <DetailColumn
                title="Moved"
                items={moves.map((item) => `${item.name} (${item.from} -> ${item.to})`)}
                empty="No movement"
              />
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function DetailColumn({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-card/80 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">{title}</p>
      <div className="mt-3 max-h-56 space-y-2 overflow-auto">
        {items.length ? (
          items.slice(0, 14).map((item) => (
            <p key={item} className="text-sm text-text-primary">
              {item}
            </p>
          ))
        ) : (
          <p className="text-sm text-text-secondary">{empty}</p>
        )}
      </div>
    </div>
  );
}
