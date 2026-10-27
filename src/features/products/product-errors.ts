import { ApiClientError } from "@/lib/api";

export type ProductOperation = "load" | "create" | "update" | "status";

export function getProductErrorMessage(
  error: unknown,
  operation: ProductOperation,
) {
  const status = error instanceof ApiClientError ? error.status : null;

  if (status === 400) {
    return "Revisá los datos ingresados e intentá nuevamente.";
  }

  if (status === 404) {
    if (operation === "create") {
      return "La categoría seleccionada ya no existe. Actualizá la página e intentá nuevamente.";
    }

    if (operation === "update") {
      return "El producto o la categoría seleccionada ya no existe. Actualizá la página e intentá nuevamente.";
    }

    return "El producto ya no existe. Actualizá la lista e intentá nuevamente.";
  }

  if (status === 409) {
    return "Ya existe un producto con ese SKU.";
  }

  if (status === 429) {
    return "Se realizaron demasiadas solicitudes. Esperá un momento e intentá nuevamente.";
  }

  if (status === 500) {
    return "El servidor no pudo completar la operación. Intentá nuevamente más tarde.";
  }

  return operation === "load"
    ? "No pudimos cargar los productos. Intentá nuevamente."
    : "No pudimos completar la operación. Intentá nuevamente.";
}
