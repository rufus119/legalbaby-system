"use client";

import { CircleUserRound, Clock3, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/layout/brand-mark";

type TopNavProps = {
  updatedAt: string;
  running: boolean;
};

export function TopNav({ updatedAt, running }: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-dashboard items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <BrandMark className="h-10 w-10" />
            <div>
              <p className="text-base font-semibold tracking-tight">LEGALBABY</p>
              <p className="text-xs text-text-secondary">Playlist Intelligence</p>
            </div>
          </div>
          <nav className="hidden items-center gap-2 rounded-2xl bg-card/80 p-1 md:flex">
            {[
              "Dashboard",
              "Charts",
              "Genres",
              "Timeline",
            ].map((item, idx) => (
              <button
                key={item}
                className={`rounded-xl px-4 py-2 text-sm ${idx === 0 ? "bg-primary/20 text-primary" : "text-text-secondary hover:text-text-primary"}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="hidden items-center gap-2 md:inline-flex">
            <Clock3 size={13} />
            {updatedAt}
          </Badge>
          <Badge className="inline-flex items-center gap-2">
            <Radio size={13} className={running ? "text-primary" : "text-text-secondary"} />
            {running ? "Running" : "Idle"}
          </Badge>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-card text-text-secondary hover:text-text-primary">
            <CircleUserRound size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
