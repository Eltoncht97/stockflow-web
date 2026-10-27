import { apiRequest } from "@/lib/api";
import type { Product, ProductInput } from "../types/product";

export const productKeys = {
  all: ["products"] as const,
};

export function listProducts() {
  return apiRequest<Product[]>("products");
}

export function createProduct(input: ProductInput) {
  return apiRequest<Product>("products", {
    method: "POST",
    body: input,
  });
}

export function updateProduct(id: string, input: ProductInput) {
  return apiRequest<Product>(`products/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export function activateProduct(id: string) {
  return apiRequest<Product>(`products/${id}/activate`, {
    method: "PATCH",
  });
}

export function deactivateProduct(id: string) {
  return apiRequest<Product>(`products/${id}/deactivate`, {
    method: "PATCH",
  });
}
