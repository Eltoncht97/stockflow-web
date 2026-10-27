"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Category } from "@/features/categories/categories-api";
import {
  productSchema,
  type ProductFormValues,
} from "../schemas/product-schema";
import type { Product } from "../types/product";

type ProductFormSheetProps = {
  categories: Category[];
  errorMessage?: string;
  isDuplicateSku: boolean;
  isPending: boolean;
  onClose: () => void;
  onSkuChange: () => void;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  product?: Product;
};

const fieldClassName =
  "mt-2 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function ProductFormSheet({
  categories,
  errorMessage,
  isDuplicateSku,
  isPending,
  onClose,
  onSkuChange,
  onSubmit,
  product,
}: ProductFormSheetProps) {
  const isEditing = Boolean(product);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      description: product?.description ?? "",
      price: product?.price ?? "",
      minStock: String(product?.minStock ?? 0),
      categoryId: product?.categoryId ?? "",
    },
    resolver: zodResolver(productSchema),
  });

  const fieldError = (name: keyof ProductFormValues) => errors[name]?.message;

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <SheetContent className="w-full p-0 sm:max-w-lg" side="right">
        <form className="flex h-full flex-col" onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader className="border-b px-6 py-5">
            <SheetTitle>{isEditing ? "Editar producto" : "Nuevo producto"}</SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Actualizá los datos del producto. El stock se gestiona desde movimientos."
                : "Completá los datos para crear el producto. El stock inicial será 0."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormField
              label="Nombre"
              error={fieldError("name")}
              id="product-name"
            >
              <input
                aria-describedby={errors.name ? "product-name-error" : undefined}
                aria-invalid={Boolean(errors.name)}
                className={fieldClassName}
                disabled={isPending}
                id="product-name"
                maxLength={150}
                {...register("name")}
              />
            </FormField>
            <FormField
              label="SKU"
              error={
                fieldError("sku") ?? (isDuplicateSku ? errorMessage : undefined)
              }
              id="product-sku"
            >
              <input
                aria-describedby={
                  errors.sku || isDuplicateSku ? "product-sku-error" : undefined
                }
                aria-invalid={Boolean(errors.sku) || isDuplicateSku}
                autoComplete="off"
                className={fieldClassName}
                disabled={isPending}
                id="product-sku"
                maxLength={50}
                {...register("sku", {
                  onChange: () => {
                    if (isDuplicateSku) onSkuChange();
                  },
                })}
              />
            </FormField>
            <FormField
              label="Descripción (opcional)"
              error={fieldError("description")}
              id="product-description"
            >
              <textarea
                aria-describedby={
                  errors.description ? "product-description-error" : undefined
                }
                aria-invalid={Boolean(errors.description)}
                className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
                disabled={isPending}
                id="product-description"
                maxLength={1000}
                rows={4}
                {...register("description")}
              />
            </FormField>
            <FormField
              label="Categoría"
              error={fieldError("categoryId")}
              id="product-category"
            >
              <select
                aria-describedby={
                  errors.categoryId ? "product-category-error" : undefined
                }
                aria-invalid={Boolean(errors.categoryId)}
                className={fieldClassName}
                disabled={isPending}
                id="product-category"
                {...register("categoryId")}
              >
                <option value="">Seleccioná una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Precio" error={fieldError("price")} id="product-price">
                <input
                  aria-describedby={errors.price ? "product-price-error" : undefined}
                  aria-invalid={Boolean(errors.price)}
                  className={fieldClassName}
                  disabled={isPending}
                  id="product-price"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...register("price")}
                />
              </FormField>
              <FormField label="Stock mínimo" error={fieldError("minStock")} id="product-min-stock">
                <input
                  aria-describedby={
                    errors.minStock ? "product-min-stock-error" : undefined
                  }
                  aria-invalid={Boolean(errors.minStock)}
                  className={fieldClassName}
                  disabled={isPending}
                  id="product-min-stock"
                  inputMode="numeric"
                  max="2147483647"
                  min="0"
                  step="1"
                  type="number"
                  {...register("minStock")}
                />
              </FormField>
            </div>
            {errorMessage && !isDuplicateSku && (
              <p className="text-sm text-destructive" role="alert">{errorMessage}</p>
            )}
          </div>

          <SheetFooter className="border-t px-6 py-4 sm:flex-row sm:justify-end">
            <SheetClose disabled={isPending} render={<Button type="button" variant="outline" />}>Cancelar</SheetClose>
            <Button disabled={isPending || categories.length === 0} type="submit">
              {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function FormField({
  children,
  error,
  id,
  label,
}: {
  children: ReactNode;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium" htmlFor={id}>{label}</label>
      {children}
      {error && <p className="mt-2 text-sm text-destructive" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}
