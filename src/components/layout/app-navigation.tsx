"use client";

import Link from "next/link";
import { Boxes, LayoutDashboard, Tags } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type AppNavigationProps = {
  compact?: boolean;
};

export function AppNavigation({ compact = false }: AppNavigationProps) {
  const pathname = usePathname();
  const navigationItems = [
    {
      href: "/",
      icon: LayoutDashboard,
      isActive: pathname === "/",
      label: "Inicio",
    },
    {
      href: "/categories",
      icon: Tags,
      isActive: pathname?.startsWith("/categories") ?? false,
      label: "Categorías",
    },
  ];

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

      <nav aria-label="Navegación principal" className="mt-8 space-y-1">
        {navigationItems.map(({ href, icon: Icon, isActive, label }) => (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      {!compact && (
        <p className="mt-auto px-3 text-xs leading-5 text-muted-foreground">
          Base del panel preparada para los próximos módulos.
        </p>
      )}
    </div>
  );
}
