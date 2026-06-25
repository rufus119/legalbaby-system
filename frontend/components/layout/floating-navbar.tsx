"use client";

import { Bell, CircleUserRound, Search } from "lucide-react";
import { motion } from "framer-motion";
import { BrandMark } from "@/components/layout/brand-mark";

type FloatingNavbarProps = {
  activeTab?: "Dashboard" | "Charts" | "Genres" | "Timeline";
};

const tabs: Array<FloatingNavbarProps["activeTab"]> = ["Dashboard", "Charts", "Genres", "Timeline"];

export function FloatingNavbar({ activeTab = "Dashboard" }: FloatingNavbarProps) {
  return (
    <header className="sticky top-5 z-40 px-4 sm:px-6">
      <motion.div
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="glass mx-auto flex max-w-dashboard items-center justify-between rounded-xl3 px-4 py-3 sm:px-6"
      >
        <div className="flex items-center gap-3">
          <BrandMark className="h-9 w-9" />
          <div>
            <p className="font-display text-sm tracking-[0.18em] text-text-primary">LEGALBABY</p>
            <p className="text-xs text-text-secondary">Playlist Intelligence</p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 lg:flex">
          {tabs.map((tab) => {
            const selected = tab === activeTab;
            return (
              <button
                key={tab}
                className={`rounded-full px-4 py-2 text-sm transition-all duration-300 ${
                  selected
                    ? "bg-white/10 text-text-primary shadow-glow"
                    : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="rounded-full border border-white/10 bg-white/5 p-2 text-text-secondary transition hover:border-white/20 hover:text-text-primary">
            <Search className="h-4 w-4" />
          </button>
          <button className="rounded-full border border-white/10 bg-white/5 p-2 text-text-secondary transition hover:border-white/20 hover:text-text-primary">
            <Bell className="h-4 w-4" />
          </button>
          <button className="rounded-full border border-white/10 bg-white/5 p-2 text-text-secondary transition hover:border-white/20 hover:text-text-primary">
            <CircleUserRound className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </header>
  );
}
