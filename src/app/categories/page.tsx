import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { CategoriesPage } from "@/features/categories/categories-page";

export const metadata: Metadata = {
  title: "Categorías",
};

export default function Page() {
  return (
    <AppShell>
      <CategoriesPage />
    </AppShell>
  );
}
