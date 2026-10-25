import type { ReactNode } from "react";
import { AppNavigation } from "@/components/layout/app-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Separator } from "@/components/ui/separator";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-sidebar p-5 text-sidebar-foreground md:block">
        <AppNavigation />
      </aside>

      <div className="flex min-h-screen flex-col md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          <MobileNavigation />
          <Separator className="h-6 md:hidden" orientation="vertical" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Panel de administración</p>
            <p className="truncate text-xs text-muted-foreground">
              Gestión simple de inventario
            </p>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
