import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { ProductsPage } from "@/features/products/components/products-page";

export const metadata: Metadata = {
  title: "Productos",
};

export default function Page() {
  return <AppShell><ProductsPage /></AppShell>;
}
