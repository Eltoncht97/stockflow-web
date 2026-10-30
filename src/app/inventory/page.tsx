import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { InventoryPage } from "@/features/inventory/inventory-page";

export const metadata: Metadata = {
  title: "Inventario",
};

export default function Page() {
  return (
    <AppShell>
      <InventoryPage />
    </AppShell>
  );
}
