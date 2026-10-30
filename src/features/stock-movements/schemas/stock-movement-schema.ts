import { z } from "zod";
import type { StockMovementInput } from "../api/stock-movements-api";

const integerPattern = /^\d+$/;
const POSTGRES_INTEGER_MAX = 2_147_483_647;

export const stockMovementSchema = z.object({
  productId: z.string().uuid("Seleccioná un producto."),
  type: z.enum(["IN", "OUT"]),
  quantity: z
    .string()
    .trim()
    .regex(integerPattern, "Ingresá una cantidad entera mayor que 0.")
    .refine(
      (value) => Number(value) >= 1,
      "Ingresá una cantidad entera mayor que 0.",
    )
    .refine(
      (value) => Number(value) <= POSTGRES_INTEGER_MAX,
      "La cantidad no puede superar 2147483647.",
    ),
  reason: z
    .string()
    .trim()
    .min(1, "Ingresá el motivo del movimiento.")
    .max(255, "El motivo no puede superar los 255 caracteres."),
});

export type StockMovementFormValues = z.infer<typeof stockMovementSchema>;

export function toStockMovementInput(
  values: StockMovementFormValues,
): StockMovementInput {
  return {
    productId: values.productId,
    type: values.type,
    quantity: Number(values.quantity),
    reason: values.reason,
  };
}
