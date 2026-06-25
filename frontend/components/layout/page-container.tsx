"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { TopNav } from "@/components/dashboard/top-nav";

type PageContainerProps = {
  updatedAt: string;
  systemStatus: "Live" | "Updating" | "Scheduled" | "Offline";
  children: React.ReactNode;
};

export function PageContainer({ updatedAt, systemStatus, children }: PageContainerProps) {
  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <TopNav updatedAt={updatedAt} systemStatus={systemStatus} />
      <main className="mx-auto w-full max-w-dashboard px-4 pb-8 pt-6 sm:px-6 lg:px-8">{children}</main>
      <BottomNav />
    </div>
  );
}
