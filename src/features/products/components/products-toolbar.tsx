import { Search } from "lucide-react";
import type { Category } from "@/features/categories/categories-api";

export type ProductStatusFilter = "all" | "active" | "inactive";

type ProductsToolbarProps = {
  categories: Category[];
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: ProductStatusFilter) => void;
  search: string;
  status: ProductStatusFilter;
};

const fieldClassName =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function ProductsToolbar({
  categories,
  categoryId,
  onCategoryChange,
  onSearchChange,
  onStatusChange,
  search,
  status,
}: ProductsToolbarProps) {
  return (
    <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1fr)_14rem_12rem]">
      <div className="sm:col-span-2 lg:col-span-1">
        <label className="sr-only" htmlFor="product-search">
          Buscar productos
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            className={`${fieldClassName} pl-9`}
            id="product-search"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nombre o SKU"
            type="search"
            value={search}
          />
        </div>
      </div>

      <div>
        <label className="sr-only" htmlFor="product-category-filter">
          Filtrar por categoría
        </label>
        <select
          className={fieldClassName}
          id="product-category-filter"
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

      <div>
        <label className="sr-only" htmlFor="product-status-filter">
          Filtrar por estado
        </label>
        <select
          className={fieldClassName}
          id="product-status-filter"
          onChange={(event) =>
            onStatusChange(event.target.value as ProductStatusFilter)
          }
          value={status}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
    </div>
  );
}
