"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "../types/product";

type ProductStatusDialogProps = {
  errorMessage?: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product;
};

export function ProductStatusDialog({ errorMessage, isPending, onClose, onConfirm, product }: ProductStatusDialogProps) {
  const action = product.isActive ? "desactivar" : "activar";
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !isPending) onClose(); }}>
      <DialogContent>
        <DialogTitle>{product.isActive ? "Desactivar producto" : "Activar producto"}</DialogTitle>
        <DialogDescription>
          ¿Querés {action} el producto <strong>{product.name}</strong>?
          {product.isActive && " Seguirá visible en la lista como inactivo."}
        </DialogDescription>
        {errorMessage && <p className="mt-4 text-sm text-destructive" role="alert">{errorMessage}</p>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose disabled={isPending} render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
          <Button disabled={isPending} onClick={onConfirm} type="button" variant={product.isActive ? "destructive" : "default"}>
            {isPending ? "Guardando..." : product.isActive ? "Desactivar producto" : "Activar producto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
