"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Clock3, Gauge, Layers3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/charts", label: "Charts", icon: BarChart3 },
  { href: "/genres", label: "Genres", icon: Layers3 },
  { href: "/timeline", label: "Timeline", icon: Clock3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-background/95 px-2 pb-2 pt-1 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center rounded-xl px-1 py-2 text-[11px] transition-colors",
                  active ? "text-primary" : "text-text-secondary"
                )}
              >
                <Icon className="mb-1 h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
