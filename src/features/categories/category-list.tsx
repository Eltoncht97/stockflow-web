import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category } from "./categories-api";

type CategoryListProps = {
  categories: Category[];
  onDelete: (category: Category) => void;
  onEdit: (category: Category) => void;
};

const categoryDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
  year: "numeric",
});

function formatCategoryCreationDate(createdAt: string) {
  return categoryDateFormatter.format(new Date(createdAt));
}

export function CategoryList({
  categories,
  onDelete,
  onEdit,
}: CategoryListProps) {
  return (
    <>
      <div className="grid gap-3 md:hidden" data-testid="category-cards">
        {categories.map((category) => (
          <article
            className="rounded-xl border bg-card p-4 shadow-sm"
            key={category.id}
          >
            <h2 className="font-semibold">{category.name}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Creada el {formatCategoryCreationDate(category.createdAt)}
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                aria-label={`Editar ${category.name}`}
                onClick={() => onEdit(category)}
                size="sm"
                type="button"
                variant="outline"
              >
                <Pencil aria-hidden="true" />
                Editar
              </Button>
              <Button
                aria-label={`Eliminar ${category.name}`}
                onClick={() => onDelete(category)}
                size="sm"
                type="button"
                variant="destructive"
              >
                <Trash2 aria-hidden="true" />
                Eliminar
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div
        className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block"
        data-testid="category-table"
      >
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-5 py-3 font-medium" scope="col">
                Nombre
              </th>
              <th className="px-5 py-3 font-medium" scope="col">
                Fecha de creación
              </th>
              <th className="px-5 py-3 text-right font-medium" scope="col">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((category) => (
              <tr key={category.id}>
                <th className="px-5 py-4 text-left font-medium" scope="row">
                  {category.name}
                </th>
                <td className="px-5 py-4 text-muted-foreground">
                  <time dateTime={category.createdAt}>
                    {formatCategoryCreationDate(category.createdAt)}
                  </time>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      aria-label={`Editar ${category.name}`}
                      onClick={() => onEdit(category)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Pencil aria-hidden="true" />
                      Editar
                    </Button>
                    <Button
                      aria-label={`Eliminar ${category.name}`}
                      onClick={() => onDelete(category)}
                      size="sm"
                      type="button"
                      variant="destructive"
                    >
                      <Trash2 aria-hidden="true" />
                      Eliminar
                    </Button>
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
