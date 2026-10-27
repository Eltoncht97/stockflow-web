import { z } from "zod";
import type { ProductInput } from "../types/product";

const pricePattern = /^\d{1,10}(?:\.\d{1,2})?$/;
const integerPattern = /^\d+$/;
const POSTGRES_INTEGER_MAX = 2_147_483_647;

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ingresá el nombre del producto.")
    .max(150, "El nombre no puede superar los 150 caracteres."),
  sku: z
    .string()
    .trim()
    .min(1, "Ingresá el SKU del producto.")
    .max(50, "El SKU no puede superar los 50 caracteres."),
  description: z
    .string()
    .trim()
    .max(1000, "La descripción no puede superar los 1000 caracteres."),
  price: z
    .string()
    .trim()
    .regex(
      pricePattern,
      "Ingresá un precio válido con hasta 2 decimales.",
    ),
  minStock: z
    .string()
    .trim()
    .regex(integerPattern, "Ingresá un stock mínimo entero mayor o igual a 0.")
    .refine(
      (value) => Number(value) <= POSTGRES_INTEGER_MAX,
      "El stock mínimo no puede superar 2147483647.",
    ),
  categoryId: z.string().min(1, "Seleccioná una categoría."),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export function toProductInput(values: ProductFormValues): ProductInput {
  return {
    sku: values.sku,
    name: values.name,
    description: values.description || null,
    categoryId: values.categoryId,
    price: values.price,
    minStock: Number(values.minStock),
  };
}
