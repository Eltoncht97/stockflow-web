"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
import type { Product } from "@/features/products/types/product";
import {
  type StockMovementFormValues,
  stockMovementSchema,
} from "../schemas/stock-movement-schema";

type StockMovementFormSheetProps = {
  errorMessage?: string;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (values: StockMovementFormValues) => Promise<void>;
  products: Product[];
};

const fieldClassName =
  "mt-2 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive";

export function StockMovementFormSheet({
  errorMessage,
  isPending,
  onClose,
  onSubmit,
  products,
}: StockMovementFormSheetProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<StockMovementFormValues>({
    defaultValues: {
      productId: "",
      type: "IN",
      quantity: "",
      reason: "",
    },
    resolver: zodResolver(stockMovementSchema),
  });
  const productId = useWatch({ control, name: "productId" });
  const movementType = useWatch({ control, name: "type" });
  const selectedProduct = products.find((product) => product.id === productId);

  const fieldError = (name: keyof StockMovementFormValues) =>
    errors[name]?.message;

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <SheetContent className="w-full p-0 sm:max-w-lg" side="right">
        <form
          className="flex h-full flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <SheetHeader className="border-b px-6 py-5">
            <SheetTitle>Nuevo movimiento</SheetTitle>
            <SheetDescription>
              Registrá una entrada o salida. El stock se actualizará al guardar.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormField
              error={fieldError("productId")}
              id="stock-movement-product"
              label="Producto"
            >
              <select
                aria-describedby={
                  errors.productId ? "stock-movement-product-error" : undefined
                }
                aria-invalid={Boolean(errors.productId)}
                className={fieldClassName}
                disabled={isPending}
                id="stock-movement-product"
                {...register("productId")}
              >
                <option value="">Seleccioná un producto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} · {product.sku}
                  </option>
                ))}
              </select>
            </FormField>

            {selectedProduct && (
              <p className="rounded-lg bg-muted px-3 py-2 text-sm" role="status">
                Stock disponible: <strong>{selectedProduct.stock}</strong>
              </p>
            )}

            <fieldset>
              <legend className="text-sm font-medium">Tipo de movimiento</legend>
              <div className="mt-2 grid grid-cols-2 gap-3">
                {[
                  { label: "Entrada", value: "IN" },
                  { label: "Salida", value: "OUT" },
                ].map((option) => (
                  <label
                    className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium focus-within:ring-3 focus-within:ring-ring/50"
                    key={option.value}
                  >
                    <input
                      disabled={isPending}
                      type="radio"
                      value={option.value}
                      {...register("type")}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <FormField
              error={fieldError("quantity")}
              id="stock-movement-quantity"
              label="Cantidad"
            >
              <input
                aria-describedby={
                  errors.quantity ? "stock-movement-quantity-error" : undefined
                }
                aria-invalid={Boolean(errors.quantity)}
                className={fieldClassName}
                disabled={isPending}
                id="stock-movement-quantity"
                inputMode="numeric"
                max="2147483647"
                min="1"
                step="1"
                type="number"
                {...register("quantity")}
              />
            </FormField>

            <FormField
              error={fieldError("reason")}
              id="stock-movement-reason"
              label="Motivo"
            >
              <textarea
                aria-describedby={
                  errors.reason ? "stock-movement-reason-error" : undefined
                }
                aria-invalid={Boolean(errors.reason)}
                className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
                disabled={isPending}
                id="stock-movement-reason"
                maxLength={255}
                rows={4}
                {...register("reason")}
              />
            </FormField>

            {errorMessage && (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage}
              </p>
            )}
          </div>

          <SheetFooter className="border-t px-6 py-4 sm:flex-row sm:justify-end">
            <SheetClose
              disabled={isPending}
              render={<Button type="button" variant="outline" />}
            >
              Cancelar
            </SheetClose>
            <Button disabled={isPending || products.length === 0} type="submit">
              {isPending
                ? "Registrando..."
                : movementType === "OUT"
                  ? "Registrar salida"
                  : "Registrar entrada"}
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
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && (
        <p
          className="mt-2 text-sm text-destructive"
          id={`${id}-error`}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
