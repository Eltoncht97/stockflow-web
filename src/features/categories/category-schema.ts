import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ingresá el nombre de la categoría.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
