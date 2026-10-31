import { Search } from "lucide-react";
import type { Category } from "@/features/categories/categories-api";

type InventoryToolbarProps = {
  categories: Category[];
  categoryFilterDisabled?: boolean;
  categoryId: string;
  lowStockOnly: boolean;
  onCategoryChange: (categoryId: string) => void;
  onLowStockOnlyChange: (lowStockOnly: boolean) => void;
  onSearchChange: (search: string) => void;
  search: string;
};

const fieldClassName =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function InventoryToolbar({
  categories,
  categoryFilterDisabled = false,
  categoryId,
  lowStockOnly,
  onCategoryChange,
  onLowStockOnlyChange,
  onSearchChange,
  search,
}: InventoryToolbarProps) {
  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1fr)_14rem_auto] lg:items-center">
      <div className="sm:col-span-2 lg:col-span-1">
        <label className="sr-only" htmlFor="inventory-search">
          Buscar inventario
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            className={`${fieldClassName} pl-9`}
            id="inventory-search"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por producto o SKU"
            type="search"
            value={search}
          />
        </div>
      </div>

      <div>
        <label className="sr-only" htmlFor="inventory-category-filter">
          Filtrar inventario por categoría
        </label>
        <select
          className={fieldClassName}
          disabled={categoryFilterDisabled}
          id="inventory-category-filter"
          onChange={(event) => onCategoryChange(event.target.value)}
          value={categoryId}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg border bg-background px-3 text-sm font-medium focus-within:ring-3 focus-within:ring-ring/50">
        <input
          checked={lowStockOnly}
          className="size-4 rounded border-input accent-primary focus-visible:outline-none"
          onChange={(event) => onLowStockOnlyChange(event.target.checked)}
          type="checkbox"
        />
        Solo stock bajo
      </label>
    </div>
  );
}
