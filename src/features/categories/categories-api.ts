import { apiRequest } from "@/lib/api";

export type Category = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryInput = {
  name: string;
};

export const categoryKeys = {
  all: ["categories"] as const,
};

export function listCategories() {
  return apiRequest<Category[]>("categories");
}

export function createCategory(input: CategoryInput) {
  return apiRequest<Category>("categories", {
    method: "POST",
    body: input,
  });
}

export function updateCategory(id: string, input: CategoryInput) {
  return apiRequest<Category>(`categories/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteCategory(id: string) {
  return apiRequest<void>(`categories/${id}`, {
    method: "DELETE",
  });
}
