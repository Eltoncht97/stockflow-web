"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { categoryKeys, listCategories, type Category } from "@/features/categories/categories-api";
import { ApiClientError } from "@/lib/api";
import { useProductStatusMutation, useProductsQuery, useSaveProductMutation } from "../hooks/use-products";
import { getProductErrorMessage } from "../product-errors";
import { toProductInput, type ProductFormValues } from "../schemas/product-schema";
import type { Product } from "../types/product";
import { ProductFormSheet } from "./product-form-sheet";
import { ProductList } from "./product-list";
import { ProductStatusDialog } from "./product-status-dialog";
import { ProductsToolbar, type ProductStatusFilter } from "./products-toolbar";

const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_CATEGORIES: Category[] = [];

export function ProductsPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [status, setStatus] = useState<ProductStatusFilter>("all");
  const [formProduct, setFormProduct] = useState<Product | null | undefined>(undefined);
  const [statusTarget, setStatusTarget] = useState<Product | null>(null);
  const productsQuery = useProductsQuery();
  const categoriesQuery = useQuery({ queryKey: categoryKeys.all, queryFn: listCategories });
  const saveMutation = useSaveProductMutation();
  const statusMutation = useProductStatusMutation();
  const products = productsQuery.data ?? EMPTY_PRODUCTS;
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES;

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");
    return products.filter((product) => {
      const matchesSearch = !normalizedSearch || product.name.toLocaleLowerCase("es").includes(normalizedSearch) || product.sku.toLocaleLowerCase("es").includes(normalizedSearch);
      const matchesCategory = categoryId === "all" || product.categoryId === categoryId;
      const matchesStatus = status === "all" || (status === "active" ? product.isActive : !product.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [categoryId, products, search, status]);

  const openCreateForm = () => { saveMutation.reset(); setFormProduct(null); };
  const openEditForm = (product: Product) => { saveMutation.reset(); setFormProduct(product); };
  const openStatusDialog = (product: Product) => { statusMutation.reset(); setStatusTarget(product); };
  const formOperation = formProduct ? "update" : "create";
  const saveError = saveMutation.error ? getProductErrorMessage(saveMutation.error, formOperation) : undefined;
  const statusError = statusMutation.error ? getProductErrorMessage(statusMutation.error, "status") : undefined;
  const isDuplicateSku = saveMutation.error instanceof ApiClientError && saveMutation.error.status === 409;
  const isLoading = productsQuery.isPending || categoriesQuery.isPending;
  const loadError = productsQuery.error ?? categoriesQuery.error;

  const saveProduct = async (values: ProductFormValues) => {
    await saveMutation.mutateAsync({ product: formProduct ?? undefined, input: toProductInput(values) }).then(() => {
      toast.success(formProduct ? "Producto actualizado correctamente." : "Producto creado correctamente.");
      setFormProduct(undefined);
    }).catch((error: unknown) => {
      toast.error(getProductErrorMessage(error, formOperation));
    });
  };

  const changeStatus = () => {
    if (!statusTarget) return;
    statusMutation.mutate(statusTarget, {
      onSuccess: () => {
        toast.success(statusTarget.isActive ? "Producto desactivado correctamente." : "Producto activado correctamente.");
        setStatusTarget(null);
      },
      onError: (error) => toast.error(getProductErrorMessage(error, "status")),
    });
  };

  return (
    <section aria-labelledby="products-title" className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Inventario</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight" id="products-title">Productos</h1>
          <p className="mt-2 text-sm text-muted-foreground">Gestioná los productos, sus precios y niveles mínimos de stock.</p>
        </div>
        <Button className="w-full sm:w-auto" disabled={categoriesQuery.isPending || categories.length === 0} onClick={openCreateForm} size="lg">
          <Plus aria-hidden="true" /> Nuevo producto
        </Button>
      </div>

      <div className="mt-6">
        <ProductsToolbar categories={categories} categoryId={categoryId} onCategoryChange={setCategoryId} onSearchChange={setSearch} onStatusChange={setStatus} search={search} status={status} />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div aria-busy="true" aria-live="polite" role="status">
            <span className="sr-only">Cargando productos...</span>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div className="h-56 animate-pulse rounded-xl border bg-muted" key={item} />)}</div>
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6" role="alert">
            <h2 className="font-semibold">No se pudieron cargar los productos</h2>
            <p className="mt-2 text-sm text-muted-foreground">{getProductErrorMessage(loadError, "load")}</p>
            <Button className="mt-4" onClick={() => { void productsQuery.refetch(); void categoriesQuery.refetch(); }} type="button" variant="outline">Intentar nuevamente</Button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-8 text-center">
            <h2 className="font-semibold">Todavía no hay productos</h2>
            <p className="mt-2 text-sm text-muted-foreground">Creá el primer producto para empezar a gestionar el inventario.</p>
            {categories.length > 0 && <Button className="mt-4" onClick={openCreateForm} type="button">Crear producto</Button>}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-8 text-center">
            <h2 className="font-semibold">No se encontraron resultados</h2>
            <p className="mt-2 text-sm text-muted-foreground">Probá con otra búsqueda o cambiá los filtros.</p>
          </div>
        ) : (
          <>
            <p aria-live="polite" className="mb-3 text-sm text-muted-foreground">{filteredProducts.length === 1 ? "1 producto" : `${filteredProducts.length} productos`}</p>
            <ProductList onEdit={openEditForm} onStatusChange={openStatusDialog} products={filteredProducts} />
          </>
        )}
      </div>

      {formProduct !== undefined && <ProductFormSheet categories={categories} errorMessage={saveError} isDuplicateSku={isDuplicateSku} isPending={saveMutation.isPending} onClose={() => setFormProduct(undefined)} onSkuChange={() => saveMutation.reset()} onSubmit={saveProduct} product={formProduct ?? undefined} />}
      {statusTarget && <ProductStatusDialog errorMessage={statusError} isPending={statusMutation.isPending} onClose={() => setStatusTarget(null)} onConfirm={changeStatus} product={statusTarget} />}
    </section>
  );
}
