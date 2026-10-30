import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { StockMovementsPage } from "@/features/stock-movements/components/stock-movements-page";

export const metadata: Metadata = {
  title: "Movimientos de stock",
};

export default function Page() {
  return (
    <AppShell>
      <StockMovementsPage />
    </AppShell>
  );
}
