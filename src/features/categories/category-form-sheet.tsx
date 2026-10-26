"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import type { Category } from "./categories-api";
import {
  categorySchema,
  type CategoryFormValues,
} from "./category-schema";

type CategoryFormSheetProps = {
  category?: Category;
  errorMessage?: string;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
};

export function CategoryFormSheet({
  category,
  errorMessage,
  isPending,
  onClose,
  onSubmit,
}: CategoryFormSheetProps) {
  const isEditing = Boolean(category);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CategoryFormValues>({
    defaultValues: {
      name: category?.name ?? "",
    },
    resolver: zodResolver(categorySchema),
  });

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onClose();
        }
      }}
    >
      <SheetContent className="w-full p-0 sm:max-w-md" side="right">
        <form
          className="flex h-full flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <SheetHeader className="border-b px-6 py-5">
            <SheetTitle>
              {isEditing ? "Editar categoría" : "Nueva categoría"}
            </SheetTitle>
            <SheetDescription>
              {isEditing
                ? "Actualizá el nombre de la categoría."
                : "Ingresá un nombre para crear una categoría."}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 px-6 py-5">
            <label className="text-sm font-medium" htmlFor="category-name">
              Nombre
            </label>
            <input
              aria-describedby={
                errors.name ? "category-name-error" : undefined
              }
              aria-invalid={Boolean(errors.name)}
              autoComplete="off"
              className="mt-2 h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              disabled={isPending}
              id="category-name"
              maxLength={100}
              {...register("name")}
            />
            {errors.name && (
              <p
                className="mt-2 text-sm text-destructive"
                id="category-name-error"
                role="alert"
              >
                {errors.name.message}
              </p>
            )}
            {errorMessage && (
              <p className="mt-4 text-sm text-destructive" role="alert">
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
            <Button disabled={isPending} type="submit">
              {isPending
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear categoría"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
