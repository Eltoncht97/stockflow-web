"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowRightLeft,
  Banknote,
  CircleCheck,
  Package,
  TriangleAlert,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  getInventorySummary,
  inventoryKeys,
} from "@/features/inventory/inventory-api";
import { useProductsQuery } from "@/features/products/hooks/use-products";
import { cn } from "@/lib/utils";
import {
  calculateInventoryValueInCents,
  formatInventoryValue,
} from "../dashboard-metrics";

type MetricCardProps = {
  description: string;
  href: string;
  icon: typeof Package;
  isError: boolean;
  isLoading: boolean;
  label: string;
  value: string;
};

function MetricCard({
  description,
  href,
  icon: Icon,
  isError,
  isLoading,
  label,
  value,
}: MetricCardProps) {
  return (
    <Link
      aria-label={`${label}: ${isLoading ? "cargando" : isError ? "no disponible" : value}. ${description}`}
      className="group rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      href={href}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <ArrowRight
          aria-hidden="true"
          className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground"
        />
      </div>
      <dl className="mt-4">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-2xl font-semibold tracking-tight">
          {isLoading ? (
            <span
              aria-hidden="true"
              className="block h-8 w-24 animate-pulse rounded bg-muted"
            />
          ) : isError ? (
            <span className="text-base">No disponible</span>
          ) : (
            value
          )}
        </dd>
      </dl>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </Link>
  );
}

export function DashboardOverview() {
  const productsQuery = useProductsQuery();
  const summaryQuery = useQuery({
    queryKey: inventoryKeys.summary,
    queryFn: getInventorySummary,
  });
  const products = productsQuery.data ?? [];
  const summary = summaryQuery.data;
  const inventoryValue = formatInventoryValue(
    calculateInventoryValueInCents(products),
  );
  const lowStockProducts = summary
    ? summary.lowStockProducts + summary.outOfStockProducts
    : 0;
  const hasError = productsQuery.isError || summaryQuery.isError;
  const isLoading = productsQuery.isPending || summaryQuery.isPending;

  return (
    <section aria-labelledby="dashboard-title" className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm font-medium text-primary">Resumen operativo</p>
        <h1
          className="mt-1 text-3xl font-semibold tracking-tight"
          id="dashboard-title"
        >
          Panel principal
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Revisá el estado actual del inventario y accedé a las tareas más
          importantes.
        </p>
      </div>

      {isLoading && (
        <p aria-live="polite" className="sr-only" role="status">
          Cargando resumen del inventario...
        </p>
      )}

      {hasError && (
        <div
          className="mt-6 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <div>
            <h2 className="font-semibold">Algunos datos no están disponibles</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Podés seguir usando el panel o intentar cargar el resumen
              nuevamente.
            </p>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              if (productsQuery.isError) void productsQuery.refetch();
              if (summaryQuery.isError) void summaryQuery.refetch();
            }}
            type="button"
            variant="outline"
          >
            Intentar nuevamente
          </Button>
        </div>
      )}

      <div
        aria-label="Métricas principales"
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          description="Todos los productos registrados"
          href="/products"
          icon={Package}
          isError={productsQuery.isError}
          isLoading={productsQuery.isPending}
          label="Total de productos"
          value={String(products.length)}
        />
        <MetricCard
          description="Productos disponibles para operar"
          href="/products"
          icon={CircleCheck}
          isError={summaryQuery.isError}
          isLoading={summaryQuery.isPending}
          label="Productos activos"
          value={String(summary?.totalProducts ?? 0)}
        />
        <MetricCard
          description="Incluye productos con stock bajo o sin stock"
          href="/inventory"
          icon={TriangleAlert}
          isError={summaryQuery.isError}
          isLoading={summaryQuery.isPending}
          label="Bajo stock"
          value={String(lowStockProducts)}
        />
        <MetricCard
          description="Precio por stock de productos activos"
          href="/inventory"
          icon={Banknote}
          isError={productsQuery.isError}
          isLoading={productsQuery.isPending}
          label="Valor del inventario"
          value={inventoryValue}
        />
      </div>

      {productsQuery.isSuccess && products.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed bg-card p-6">
          <h2 className="font-semibold">Empezá a cargar tu inventario</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Creá productos para ver métricas y registrar movimientos de stock.
          </p>
          <Link className={cn(buttonVariants(), "mt-4")} href="/products">
            Ir a productos
          </Link>
        </div>
      )}

      <section
        aria-labelledby="recent-movements-title"
        className="mt-6 rounded-xl border bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ArrowRightLeft aria-hidden="true" className="size-5" />
            </span>
            <h2 className="mt-4 text-lg font-semibold" id="recent-movements-title">
              Movimientos recientes
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              El historial general no está disponible en la API actual. Podés
              consultar los movimientos de cada producto en la sección de
              movimientos.
            </p>
          </div>
          <Link
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full shrink-0 sm:w-auto",
            )}
            href="/stock-movements"
          >
            Consultar movimientos
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </section>
  );
}
