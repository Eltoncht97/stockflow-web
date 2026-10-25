"use client";

import { Menu } from "lucide-react";
import { AppNavigation } from "@/components/layout/app-navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            aria-label="Abrir menú"
            className="md:hidden"
            size="icon-lg"
            type="button"
            variant="ghost"
          />
        }
      >
        <Menu aria-hidden="true" />
      </SheetTrigger>
      <SheetContent className="w-[18rem] p-0" side="left">
        <SheetHeader className="sr-only">
          <SheetTitle>Menú principal</SheetTitle>
          <SheetDescription>Navegación de StockFlow</SheetDescription>
        </SheetHeader>
        <div className="h-full px-4 py-5">
          <AppNavigation compact />
        </div>
      </SheetContent>
    </Sheet>
  );
}
