import { ApiClientError } from "@/lib/api";

export type CategoryOperation = "load" | "create" | "update" | "delete";

export function getCategoryErrorMessage(
  error: unknown,
  operation: CategoryOperation,
) {
  const status = error instanceof ApiClientError ? error.status : null;

  if (status === 400) {
    return "Revisá los datos ingresados e intentá nuevamente.";
  }

  if (status === 404) {
    return "La categoría ya no existe. Actualizá la lista e intentá nuevamente.";
  }

  if (status === 409) {
    return operation === "delete"
      ? "No se puede eliminar la categoría porque tiene productos asociados."
      : "Ya existe una categoría con ese nombre.";
  }

  if (status === 429) {
    return "Se realizaron demasiadas solicitudes. Esperá un momento e intentá nuevamente.";
  }

  if (status === 500) {
    return "El servidor no pudo completar la operación. Intentá nuevamente más tarde.";
  }

  return operation === "load"
    ? "No pudimos cargar las categorías. Intentá nuevamente."
    : "No pudimos completar la operación. Intentá nuevamente.";
}
