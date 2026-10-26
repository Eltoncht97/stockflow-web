"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Category } from "./categories-api";

type DeleteCategoryDialogProps = {
  category: Category;
  errorMessage?: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteCategoryDialog({
  category,
  errorMessage,
  isPending,
  onClose,
  onConfirm,
}: DeleteCategoryDialogProps) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogTitle>Eliminar categoría</DialogTitle>
        <DialogDescription>
          ¿Querés eliminar la categoría <strong>{category.name}</strong>? Esta
          acción no se puede deshacer.
        </DialogDescription>

        {errorMessage && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose
            disabled={isPending}
            render={<Button type="button" variant="outline" />}
          >
            Cancelar
          </DialogClose>
          <Button
            disabled={isPending}
            onClick={onConfirm}
            type="button"
            variant="destructive"
          >
            {isPending ? "Eliminando..." : "Eliminar categoría"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
