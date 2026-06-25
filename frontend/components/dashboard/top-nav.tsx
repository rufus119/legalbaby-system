"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Clock3, FolderCog, LifeBuoy, Settings, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/layout/brand-mark";
import { cn } from "@/lib/utils";

type TopNavProps = {
  updatedAt: string;
  systemStatus: "Live" | "Updating" | "Scheduled" | "Offline";
};

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/charts", label: "Charts" },
  { href: "/genres", label: "Genres" },
  { href: "/timeline", label: "Timeline" },
  { href: "/settings", label: "Settings" },
];

export function TopNav({ updatedAt, systemStatus }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const statusClass =
    systemStatus === "Live"
      ? "text-success"
      : systemStatus === "Updating"
        ? "text-primary"
        : systemStatus === "Scheduled"
          ? "text-secondary"
          : "text-danger";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-dashboard items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <BrandMark className="h-10 w-10" />
            <div>
              <p className="text-base font-semibold tracking-tight">LEGALBABY</p>
              <p className="text-xs text-text-secondary">Playlist Intelligence</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-2 rounded-2xl bg-card/80 p-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm transition-colors",
                  pathname === item.href ? "bg-primary/20 text-primary" : "text-text-secondary hover:text-text-primary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="hidden items-center gap-2 md:inline-flex">
            <Clock3 size={13} />
            {updatedAt}
          </Badge>
          <Badge className="inline-flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", statusClass, "bg-current")} />
            System Status: {systemStatus}
          </Badge>
          <button
            onClick={() => setWorkspaceOpen((prev) => !prev)}
            className="rounded-xl border border-white/10 bg-card px-3 py-2 text-xs text-text-secondary transition hover:text-text-primary"
          >
            Workspace Menu
          </button>
          {workspaceOpen ? (
            <div className="absolute right-6 top-[72px] w-44 rounded-xl border border-white/10 bg-surface p-2 shadow-card lg:right-8">
              <button
                onClick={() => {
                  setWorkspaceOpen(false);
                  router.push("/settings#profile");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary"
              >
                <UserCircle2 className="h-4 w-4" />
                Profile
              </button>
              <button
                onClick={() => {
                  setWorkspaceOpen(false);
                  router.push("/settings#exports");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary"
              >
                <FolderCog className="h-4 w-4" />
                Exports
              </button>
              <button
                onClick={() => {
                  setWorkspaceOpen(false);
                  router.push("/settings");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <a
                href="https://github.com/rufus119/legalbaby-system"
                target="_blank"
                rel="noreferrer"
                onClick={() => setWorkspaceOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary"
              >
                <LifeBuoy className="h-4 w-4" />
                Help
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
