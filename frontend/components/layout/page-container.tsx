"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { TopNav } from "@/components/dashboard/top-nav";
import { AlertItem } from "@/lib/insights-engine";

type PageContainerProps = {
  updatedAt: string;
  systemStatus: "Live" | "Updating" | "Scheduled" | "Offline";
  alerts?: AlertItem[];
  children: React.ReactNode;
};

export function PageContainer({ updatedAt, systemStatus, alerts = [], children }: PageContainerProps) {
  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <TopNav updatedAt={updatedAt} systemStatus={systemStatus} alerts={alerts} />
      <main className="mx-auto w-full max-w-dashboard px-4 pb-8 pt-6 sm:px-6 lg:px-8">{children}</main>
      <BottomNav />
    </div>
  );
}
