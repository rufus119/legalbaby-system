"use client";

import { animate } from "framer-motion";
import { useEffect, useState } from "react";

type CountUpProps = {
  value: number;
  duration?: number;
  suffix?: string;
};

export function CountUp({ value, duration = 0.9, suffix = "" }: CountUpProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [duration, value]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}
