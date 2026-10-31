import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";

export const metadata: Metadata = {
  title: "Panel principal",
};

export default function Page() {
  return (
    <AppShell>
      <DashboardOverview />
    </AppShell>
  );
}
