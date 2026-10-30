"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useProductsQuery } from "@/features/products/hooks/use-products";
import type { Product } from "@/features/products/types/product";
import { StockMovementHistory } from "./stock-movement-history";
import { StockMovementFormSheet } from "./stock-movement-form-sheet";
import {
  useCreateStockMovementMutation,
  useStockMovementHistoryQuery,
} from "../hooks/use-stock-movements";
import {
  toStockMovementInput,
  type StockMovementFormValues,
} from "../schemas/stock-movement-schema";
import { getStockMovementErrorMessage } from "../stock-movement-errors";

const EMPTY_PRODUCTS: Product[] = [];
type MovementTypeFilter = "all" | "IN" | "OUT";

const selectClassName =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:max-w-md";

export function StockMovementsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [historyProductId, setHistoryProductId] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] =
    useState<MovementTypeFilter>("all");
  const productsQuery = useProductsQuery();
  const createMutation = useCreateStockMovementMutation();
  const historyQuery = useStockMovementHistoryQuery(historyProductId);
  const products = productsQuery.data ?? EMPTY_PRODUCTS;
  const activeProducts = products.filter((product) => product.isActive);
  const selectedProduct = products.find(
    (product) => product.id === historyProductId,
  );
  const filteredMovements = (historyQuery.data ?? []).filter(
    (movement) =>
      movementTypeFilter === "all" || movement.type === movementTypeFilter,
  );
  const createError = createMutation.error
    ? getStockMovementErrorMessage(
        createMutation.error,
        "create",
        createMutation.variables?.type,
      )
    : undefined;

  const openForm = () => {
    createMutation.reset();
    setFormOpen(true);
  };

  const createMovement = async (values: StockMovementFormValues) => {
    const input = toStockMovementInput(values);

    await createMutation
      .mutateAsync(input)
      .then((movement) => {
        toast.success(
          movement.type === "IN"
            ? "Entrada registrada correctamente."
            : "Salida registrada correctamente.",
        );
        setMovementTypeFilter("all");
        setHistoryProductId(movement.productId);
        setFormOpen(false);
      })
      .catch((error: unknown) => {
        toast.error(getStockMovementErrorMessage(error, "create", input.type));
      });
  };

  return (
    <section
      aria-labelledby="stock-movements-title"
      className="mx-auto max-w-7xl"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Inventario</p>
          <h1
            className="mt-1 text-3xl font-semibold tracking-tight"
            id="stock-movements-title"
          >
            Movimientos de stock
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Registrá entradas y salidas, y consultá el historial por producto.
          </p>
        </div>
        <Button
          className="w-full sm:w-auto"
          disabled={productsQuery.isPending || activeProducts.length === 0}
          onClick={openForm}
          size="lg"
        >
          <Plus aria-hidden="true" /> Nuevo movimiento
        </Button>
      </div>

      {productsQuery.isPending ? (
        <div
          aria-busy="true"
          aria-live="polite"
          className="mt-6"
          role="status"
        >
          <span className="sr-only">Cargando productos...</span>
          <div className="h-32 animate-pulse rounded-xl border bg-muted" />
        </div>
      ) : productsQuery.error ? (
        <div
          className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-6"
          role="alert"
        >
          <h2 className="font-semibold">No se pudieron cargar los productos</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {getStockMovementErrorMessage(productsQuery.error, "products")}
          </p>
          <Button
            className="mt-4"
            onClick={() => void productsQuery.refetch()}
            type="button"
            variant="outline"
          >
            Intentar nuevamente
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed bg-card p-8 text-center">
          <h2 className="font-semibold">Todavía no hay productos</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Creá un producto antes de registrar movimientos de stock.
          </p>
        </div>
      ) : (
        <>
          {activeProducts.length === 0 && (
            <div
              className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
              role="status"
            >
              No hay productos activos para registrar movimientos.
            </div>
          )}

          <div className="mt-6 rounded-xl border bg-card p-4 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">Historial por producto</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                La API ofrece el historial de un producto a la vez.
              </p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="text-sm font-medium"
                  htmlFor="stock-movement-history-product"
                >
                  Producto
                </label>
                <select
                  className={`${selectClassName} mt-2 block`}
                  id="stock-movement-history-product"
                  onChange={(event) => {
                    setHistoryProductId(event.target.value);
                    setMovementTypeFilter("all");
                  }}
                  value={historyProductId}
                >
                  <option value="">Seleccioná un producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} · {product.sku}
                      {product.isActive ? "" : " · Inactivo"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="text-sm font-medium"
                  htmlFor="stock-movement-type-filter"
                >
                  Filtrar por tipo
                </label>
                <select
                  className={`${selectClassName} mt-2 block`}
                  disabled={!historyProductId}
                  id="stock-movement-type-filter"
                  onChange={(event) =>
                    setMovementTypeFilter(
                      event.target.value as MovementTypeFilter,
                    )
                  }
                  value={movementTypeFilter}
                >
                  <option value="all">Todos los tipos</option>
                  <option value="IN">Entradas</option>
                  <option value="OUT">Salidas</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              {!historyProductId ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Seleccioná un producto para consultar sus movimientos.
                </div>
              ) : historyQuery.isPending ? (
                <div aria-busy="true" aria-live="polite" role="status">
                  <span className="sr-only">Cargando historial...</span>
                  <div className="h-32 animate-pulse rounded-lg bg-muted" />
                </div>
              ) : historyQuery.error ? (
                <div
                  className="rounded-lg border border-destructive/30 bg-destructive/5 p-5"
                  role="alert"
                >
                  <h3 className="font-semibold">No se pudo cargar el historial</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {getStockMovementErrorMessage(
                      historyQuery.error,
                      "history",
                    )}
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => void historyQuery.refetch()}
                    type="button"
                    variant="outline"
                  >
                    Intentar nuevamente
                  </Button>
                </div>
              ) : historyQuery.data?.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <h3 className="font-semibold">Sin movimientos registrados</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedProduct?.name} todavía no tiene movimientos de stock.
                  </p>
                </div>
              ) : filteredMovements.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <h3 className="font-semibold">
                    No hay movimientos para este filtro
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Probá con otro tipo de movimiento.
                  </p>
                </div>
              ) : (
                <StockMovementHistory movements={filteredMovements} />
              )}
            </div>
          </div>
        </>
      )}

      {formOpen && (
        <StockMovementFormSheet
          errorMessage={createError}
          isPending={createMutation.isPending}
          onClose={() => setFormOpen(false)}
          onSubmit={createMovement}
          products={activeProducts}
        />
      )}
    </section>
  );
}
