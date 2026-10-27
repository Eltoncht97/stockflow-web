import { Pencil, Power, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "../types/product";

type ProductListProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onStatusChange: (product: Product) => void;
};

const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

function formatPrice(price: string) {
  return priceFormatter.format(Number(price));
}

function StockBadge({ product }: { product: Product }) {
  const state =
    product.stock === 0
      ? { label: "Sin stock", className: "bg-destructive/10 text-destructive" }
      : product.stock <= product.minStock
        ? {
            label: "Stock bajo",
            className:
              "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
          }
        : {
            label: "Stock normal",
            className:
              "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
          };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-medium",
        state.className,
      )}
    >
      {state.label}
    </span>
  );
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-1 text-xs font-medium",
        isActive
          ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
          : "bg-muted text-muted-foreground",
      )}
    >
      {isActive ? "Activo" : "Inactivo"}
    </span>
  );
}

function ProductActions({
  product,
  onEdit,
  onStatusChange,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onStatusChange: (product: Product) => void;
}) {
  const statusAction = product.isActive ? "Desactivar" : "Activar";

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        aria-label={`Editar ${product.name}`}
        onClick={() => onEdit(product)}
        size="sm"
        type="button"
        variant="outline"
      >
        <Pencil aria-hidden="true" />
        Editar
      </Button>
      <Button
        aria-label={`${statusAction} ${product.name}`}
        onClick={() => onStatusChange(product)}
        size="sm"
        type="button"
        variant={product.isActive ? "destructive" : "secondary"}
      >
        {product.isActive ? (
          <PowerOff aria-hidden="true" />
        ) : (
          <Power aria-hidden="true" />
        )}
        {statusAction}
      </Button>
    </div>
  );
}

export function ProductList({
  products,
  onEdit,
  onStatusChange,
}: ProductListProps) {
  return (
    <>
      <div className="grid gap-3 md:hidden" data-testid="product-cards">
        {products.map((product) => (
          <article
            className="rounded-xl border bg-card p-4 shadow-sm"
            key={product.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-semibold">{product.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  SKU: {product.sku}
                </p>
              </div>
              <ActiveBadge isActive={product.isActive} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Categoría</dt>
                <dd className="mt-1 font-medium">{product.category.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Precio</dt>
                <dd className="mt-1 font-medium">{formatPrice(product.price)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Stock actual</dt>
                <dd className="mt-1 font-medium">{product.stock}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Stock mínimo</dt>
                <dd className="mt-1 font-medium">{product.minStock}</dd>
              </div>
            </dl>
            <div className="mt-3">
              <StockBadge product={product} />
            </div>
            <div className="mt-4">
              <ProductActions
                onEdit={onEdit}
                onStatusChange={onStatusChange}
                product={product}
              />
            </div>
          </article>
        ))}
      </div>

      <div
        className="hidden overflow-x-auto rounded-xl border bg-card shadow-sm md:block"
        data-testid="product-table"
      >
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              {[
                "Producto",
                "SKU",
                "Categoría",
                "Precio",
                "Stock",
                "Stock mínimo",
                "Estado",
              ].map((heading) => (
                <th className="px-4 py-3 font-medium" key={heading} scope="col">
                  {heading}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium" scope="col">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id}>
                <th className="px-4 py-4 text-left font-medium" scope="row">
                  <div>{product.name}</div>
                  <div className="mt-1"><StockBadge product={product} /></div>
                </th>
                <td className="px-4 py-4 text-muted-foreground">{product.sku}</td>
                <td className="px-4 py-4">{product.category.name}</td>
                <td className="px-4 py-4 whitespace-nowrap">{formatPrice(product.price)}</td>
                <td className="px-4 py-4">{product.stock}</td>
                <td className="px-4 py-4">{product.minStock}</td>
                <td className="px-4 py-4"><ActiveBadge isActive={product.isActive} /></td>
                <td className="px-4 py-4">
                  <div className="flex justify-end">
                    <ProductActions
                      onEdit={onEdit}
                      onStatusChange={onStatusChange}
                      product={product}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
