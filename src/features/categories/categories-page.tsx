"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { inventoryKeys } from "@/features/inventory/inventory-api";
import { productKeys } from "@/features/products/api/products-api";
import {
  categoryKeys,
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
  type Category,
} from "./categories-api";
import { CategoryFormSheet } from "./category-form-sheet";
import { CategoryList } from "./category-list";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { getCategoryErrorMessage } from "./category-errors";
import type { CategoryFormValues } from "./category-schema";

type FormState = {
  category?: Category;
};

const EMPTY_CATEGORIES: Category[] = [];

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [formState, setFormState] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const categoriesQuery = useQuery({
    queryKey: categoryKeys.all,
    queryFn: listCategories,
  });

  const saveMutation = useMutation({
    mutationFn: ({ category, values }: FormState & { values: CategoryFormValues }) =>
      category
        ? updateCategory(category.id, values)
        : createCategory(values),
    onSuccess: async (_category, variables) => {
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
      ];

      if (variables.category) {
        invalidations.push(
          queryClient.invalidateQueries({ queryKey: productKeys.all }),
          queryClient.invalidateQueries({ queryKey: inventoryKeys.list }),
        );
      }

      await Promise.all(invalidations);
      toast.success(
        variables.category
          ? "Categoría actualizada correctamente."
          : "Categoría creada correctamente.",
      );
      setFormState(null);
    },
    onError: (error, variables) => {
      toast.error(
        getCategoryErrorMessage(
          error,
          variables.category ? "update" : "create",
        ),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (category: Category) => deleteCategory(category.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Categoría eliminada correctamente.");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(getCategoryErrorMessage(error, "delete"));
    },
  });

  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES;
  const normalizedSearch = search.trim().toLocaleLowerCase("es");
  const filteredCategories = useMemo(
    () =>
      normalizedSearch
        ? categories.filter((category) =>
            category.name.toLocaleLowerCase("es").includes(normalizedSearch),
          )
        : categories,
    [categories, normalizedSearch],
  );

  const openCreateForm = () => {
    saveMutation.reset();
    setFormState({});
  };

  const openEditForm = (category: Category) => {
    saveMutation.reset();
    setFormState({ category });
  };

  const openDeleteDialog = (category: Category) => {
    deleteMutation.reset();
    setDeleteTarget(category);
  };

  const saveError = saveMutation.error
    ? getCategoryErrorMessage(
        saveMutation.error,
        formState?.category ? "update" : "create",
      )
    : undefined;
  const deleteError = deleteMutation.error
    ? getCategoryErrorMessage(deleteMutation.error, "delete")
    : undefined;

  return (
    <section aria-labelledby="categories-title" className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Inventario</p>
          <h1
            className="mt-1 text-3xl font-semibold tracking-tight"
            id="categories-title"
          >
            Categorías
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Organizá los productos con nombres claros y fáciles de encontrar.
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={openCreateForm} size="lg">
          <Plus aria-hidden="true" />
          Nueva categoría
        </Button>
      </div>

      <div className="mt-6 rounded-xl border bg-card p-4 shadow-sm">
        <label className="sr-only" htmlFor="category-search">
          Buscar categorías
        </label>
        <div className="relative max-w-md">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            className="h-10 w-full rounded-lg border bg-background pr-3 pl-9 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            id="category-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre"
            type="search"
            value={search}
          />
        </div>
      </div>

      <div className="mt-4">
        {categoriesQuery.isPending ? (
          <div aria-live="polite" aria-busy="true" role="status">
            <span className="sr-only">Cargando categorías...</span>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  className="h-24 animate-pulse rounded-xl border bg-muted"
                  key={item}
                />
              ))}
            </div>
          </div>
        ) : categoriesQuery.isError ? (
          <div
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"
            role="alert"
          >
            <h2 className="font-semibold">No se pudieron cargar las categorías</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {getCategoryErrorMessage(categoriesQuery.error, "load")}
            </p>
            <Button
              className="mt-4"
              onClick={() => categoriesQuery.refetch()}
              type="button"
              variant="outline"
            >
              Intentar nuevamente
            </Button>
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-8 text-center">
            <h2 className="font-semibold">Todavía no hay categorías</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Creá la primera categoría para empezar a organizar el inventario.
            </p>
            <Button className="mt-4" onClick={openCreateForm} type="button">
              Crear categoría
            </Button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-8 text-center">
            <h2 className="font-semibold">No hay resultados</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Probá con otro nombre de categoría.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
              {filteredCategories.length === 1
                ? "1 categoría"
                : `${filteredCategories.length} categorías`}
            </p>
            <CategoryList
              categories={filteredCategories}
              onDelete={openDeleteDialog}
              onEdit={openEditForm}
            />
          </>
        )}
      </div>

      {formState && (
        <CategoryFormSheet
          category={formState.category}
          errorMessage={saveError}
          isPending={saveMutation.isPending}
          onClose={() => setFormState(null)}
          onSubmit={async (values) => {
            await saveMutation.mutateAsync({ ...formState, values }).catch(() => {
              // Mutation errors stay visible in the open form and Sonner toast.
            });
          }}
        />
      )}

      {deleteTarget && (
        <DeleteCategoryDialog
          category={deleteTarget}
          errorMessage={deleteError}
          isPending={deleteMutation.isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteMutation.mutate(deleteTarget)}
        />
      )}
    </section>
  );
}
