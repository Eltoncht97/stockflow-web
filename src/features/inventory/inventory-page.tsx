"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  categoryKeys,
  listCategories,
  type Category,
} from "@/features/categories/categories-api";
import {
  inventoryKeys,
  listInventory,
  type InventoryItem,
} from "./inventory-api";
import { InventoryList } from "./inventory-list";
import { InventoryToolbar } from "./inventory-toolbar";

const EMPTY_INVENTORY: InventoryItem[] = [];
const EMPTY_CATEGORIES: Category[] = [];

export function InventoryPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const inventoryQuery = useQuery({
    queryKey: inventoryKeys.list,
    queryFn: listInventory,
  });
  const categoriesQuery = useQuery({
    queryKey: categoryKeys.all,
    queryFn: listCategories,
  });
  const inventory = inventoryQuery.data ?? EMPTY_INVENTORY;
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES;

  const filteredInventory = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");

    return inventory.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.name.toLocaleLowerCase("es").includes(normalizedSearch) ||
        item.sku.toLocaleLowerCase("es").includes(normalizedSearch);
      const matchesCategory =
        categoryId === "all" || item.category.id === categoryId;
      const matchesLowStock =
        !lowStockOnly ||
        item.status === "LOW_STOCK" ||
        item.status === "OUT_OF_STOCK";

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [categoryId, inventory, lowStockOnly, search]);

  const categoriesUnavailable = categoriesQuery.isPending || categoriesQuery.isError;

  return (
    <section aria-labelledby="inventory-title" className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm font-medium text-primary">Inventario</p>
        <h1
          className="mt-1 text-3xl font-semibold tracking-tight"
          id="inventory-title"
        >
          Stock actual
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Consultá las existencias y detectá productos con stock bajo.
        </p>
      </div>

      <div className="mt-6">
        <InventoryToolbar
          categories={categories}
          categoryFilterDisabled={categoriesUnavailable}
          categoryId={categoryId}
          lowStockOnly={lowStockOnly}
          onCategoryChange={setCategoryId}
          onLowStockOnlyChange={setLowStockOnly}
          onSearchChange={setSearch}
          search={search}
        />
      </div>

      {categoriesQuery.isPending && !inventoryQuery.isPending && (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          Cargando categorías. El filtro por categoría estará disponible en breve.
        </p>
      )}
      {categoriesQuery.isError && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100" role="alert">
          <p className="font-medium">No se pudieron cargar las categorías</p>
          <p className="mt-1">Podés consultar el inventario y usar los demás filtros.</p>
          <Button className="mt-3" onClick={() => void categoriesQuery.refetch()} type="button" variant="outline">Reintentar categorías</Button>
        </div>
      )}

      <div className="mt-4">
        {inventoryQuery.isPending ? (
          <div aria-busy="true" aria-live="polite" role="status">
            <span className="sr-only">Cargando inventario...</span>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  className="h-48 animate-pulse rounded-xl border bg-muted"
                  key={item}
                />
              ))}
            </div>
          </div>
        ) : inventoryQuery.isError ? (
          <div
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"
            role="alert"
          >
            <h2 className="font-semibold">No se pudo cargar el inventario</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ocurrió un error al consultar los datos. Intentá nuevamente.
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                void inventoryQuery.refetch();
              }}
              type="button"
              variant="outline"
            >
              Intentar nuevamente
            </Button>
          </div>
        ) : inventory.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-8 text-center">
            <h2 className="font-semibold">Todavía no hay inventario</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Los productos activos aparecerán aquí cuando estén disponibles.
            </p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-8 text-center">
            <h2 className="font-semibold">No se encontraron resultados</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Probá con otra búsqueda o cambiá los filtros.
            </p>
          </div>
        ) : (
          <>
            <p aria-live="polite" className="mb-3 text-sm text-muted-foreground">
              {filteredInventory.length === 1
                ? "1 producto"
                : `${filteredInventory.length} productos`}
            </p>
            <InventoryList items={filteredInventory} />
          </>
        )}
      </div>
    </section>
  );
}
