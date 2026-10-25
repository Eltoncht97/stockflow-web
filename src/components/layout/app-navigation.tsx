import Link from "next/link";
import { Boxes, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

type AppNavigationProps = {
  compact?: boolean;
};

export function AppNavigation({ compact = false }: AppNavigationProps) {
  return (
    <div className="flex h-full flex-col">
      <Link
        className="flex items-center gap-3 rounded-lg px-2 py-1 text-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href="/"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Boxes aria-hidden="true" className="size-5" />
        </span>
        <span>StockFlow</span>
      </Link>

      <nav aria-label="Navegación principal" className="mt-8">
        <Link
          aria-current="page"
          className={cn(
            "flex items-center gap-3 rounded-lg bg-sidebar-accent px-3 py-2 text-sm font-medium text-sidebar-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          )}
          href="/"
        >
          <LayoutDashboard aria-hidden="true" className="size-4" />
          Inicio
        </Link>
      </nav>

      {!compact && (
        <p className="mt-auto px-3 text-xs leading-5 text-muted-foreground">
          Base del panel preparada para los próximos módulos.
        </p>
      )}
    </div>
  );
}
