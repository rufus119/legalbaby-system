"use client";

import { motion } from "framer-motion";

const particles = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  size: 2 + ((i * 3) % 7),
  left: `${6 + ((i * 7) % 88)}%`,
  duration: 7 + (i % 5),
  delay: i * 0.3,
}));

export function BackgroundAmbience() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 52, ease: "linear" }}
        className="absolute -left-28 -top-36 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,106,0,0.26) 0%, rgba(255,106,0,0.07) 36%, rgba(255,106,0,0) 70%)",
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 66, ease: "linear" }}
        className="absolute -bottom-40 right-[-120px] h-[560px] w-[560px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,142,60,0.22) 0%, rgba(255,142,60,0.06) 40%, rgba(255,142,60,0) 72%)",
        }}
      />

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-orange-200/40"
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.left,
            bottom: "-10%",
          }}
          animate={{ y: [0, -850], opacity: [0, 0.65, 0] }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
