import { ApiClientError } from "@/lib/api";
import type { MovementType } from "./api/stock-movements-api";

export type StockMovementOperation = "create" | "history" | "products";

export function getStockMovementErrorMessage(
  error: unknown,
  operation: StockMovementOperation,
  type?: MovementType,
) {
  const status = error instanceof ApiClientError ? error.status : null;

  if (status === 400) {
    return "Revisá los datos ingresados e intentá nuevamente.";
  }

  if (status === 404) {
    return "El producto ya no existe. Actualizá la lista e intentá nuevamente.";
  }

  if (status === 409 && type === "OUT") {
    return "No se pudo registrar la salida. El producto puede estar inactivo o no tener stock suficiente.";
  }

  if (status === 409 && type === "IN") {
    return "No se pudo registrar la entrada. El producto puede estar inactivo o haber alcanzado el stock máximo.";
  }

  if (status === 409) {
    return "No se pudo registrar el movimiento por el estado actual del producto.";
  }

  if (status === 429) {
    return "Se realizaron demasiadas solicitudes. Esperá un momento e intentá nuevamente.";
  }

  if (status === 500) {
    return "El servidor no pudo completar la operación. Intentá nuevamente más tarde.";
  }

  if (operation === "history") {
    return "No pudimos cargar el historial. Intentá nuevamente.";
  }

  if (operation === "products") {
    return "No pudimos cargar los productos. Intentá nuevamente.";
  }

  return "No pudimos registrar el movimiento. Intentá nuevamente.";
}
