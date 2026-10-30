import { cn } from "@/lib/utils";
import type { InventoryItem, InventoryStatus } from "./inventory-api";

type InventoryListProps = {
  items: InventoryItem[];
};

const statusPresentation: Record<
  InventoryStatus,
  { className: string; label: string }
> = {
  IN_STOCK: {
    className:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
    label: "Stock normal",
  },
  LOW_STOCK: {
    className:
      "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
    label: "Stock bajo",
  },
  OUT_OF_STOCK: {
    className: "bg-destructive/10 text-destructive",
    label: "Sin stock",
  },
};

function StockStatus({ status }: { status: InventoryStatus }) {
  const presentation = statusPresentation[status];

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-medium",
        presentation.className,
      )}
    >
      {presentation.label}
    </span>
  );
}

export function InventoryList({ items }: InventoryListProps) {
  return (
    <>
      <div className="grid gap-3 lg:hidden" data-testid="inventory-cards">
        {items.map((item) => (
          <article
            className="rounded-xl border bg-card p-4 shadow-sm"
            key={item.productId}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-semibold">{item.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  SKU: {item.sku}
                </p>
              </div>
              <StockStatus status={item.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div className="col-span-2">
                <dt className="text-muted-foreground">Categoría</dt>
                <dd className="mt-1 font-medium">{item.category.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Stock actual</dt>
                <dd className="mt-1 text-lg font-semibold">{item.stock}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Stock mínimo</dt>
                <dd className="mt-1 text-lg font-semibold">{item.minStock}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div
        className="hidden overflow-hidden rounded-xl border bg-card shadow-sm lg:block"
        data-testid="inventory-table"
      >
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">
            Inventario actual por producto
          </caption>
          <thead className="bg-muted/60 text-left">
            <tr>
              {[
                "Producto",
                "SKU",
                "Categoría",
                "Stock actual",
                "Stock mínimo",
                "Estado",
              ].map((heading) => (
                <th className="px-4 py-3 font-medium" key={heading} scope="col">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.productId}>
                <th className="px-4 py-4 text-left font-medium" scope="row">
                  {item.name}
                </th>
                <td className="px-4 py-4 text-muted-foreground">{item.sku}</td>
                <td className="px-4 py-4">{item.category.name}</td>
                <td className="px-4 py-4 font-medium">{item.stock}</td>
                <td className="px-4 py-4">{item.minStock}</td>
                <td className="px-4 py-4">
                  <StockStatus status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
