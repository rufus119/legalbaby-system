"use client";

import { motion } from "framer-motion";
import { HeroWaveChart } from "@/components/charts/hero-wave-chart";
import { CountUp } from "@/components/animations/count-up";

type HeroSectionProps = {
  playlistCount: number;
  tracksCount: number;
};

const stats = [
  { label: "Playlists", key: "playlists" },
  { label: "Tracks", key: "tracks" },
  { label: "Auto", key: "auto" },
  { label: "Insights", key: "insights" },
] as const;

export function HeroSection({ playlistCount, tracksCount }: HeroSectionProps) {
  const safePlaylistCount = playlistCount || 11;
  const safeTracks = tracksCount || 1000;

  return (
    <section className="section-frame relative overflow-hidden p-6 sm:p-8 lg:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,106,0,0.18),transparent_52%)]" />
      <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-3 text-xs uppercase tracking-[0.28em] text-text-secondary"
          >
            LEGALBABY
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.06 }}
            className="font-display text-5xl leading-[0.94] text-text-primary sm:text-6xl lg:text-7xl"
          >
            PLAYLIST
            <br />
            <span className="text-gradient">INTELLIGENCE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14 }}
            className="mt-5 max-w-lg text-base text-text-secondary sm:text-lg"
          >
            Track movement. Discover momentum. Update faster.
          </motion.p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 + index * 0.08 }}
                className="rounded-2xl border border-white/5 bg-surface/65 px-3 py-4 text-center"
              >
                <p className="font-display text-xl text-text-primary">
                  {stat.key === "playlists" ? <CountUp value={safePlaylistCount} /> : null}
                  {stat.key === "tracks" ? <CountUp value={safeTracks} suffix="+" /> : null}
                  {stat.key === "auto" ? "Updated" : null}
                  {stat.key === "insights" ? "Live" : null}
                </p>
                <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <HeroWaveChart />
      </div>
    </section>
  );
}
