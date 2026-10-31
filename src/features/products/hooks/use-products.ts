import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryKeys } from "@/features/inventory/inventory-api";
import {
  activateProduct,
  createProduct,
  deactivateProduct,
  listProducts,
  productKeys,
  updateProduct,
} from "../api/products-api";
import type { Product, ProductInput } from "../types/product";

export type SaveProductVariables = {
  product?: Product;
  input: ProductInput;
};

export function useProductsQuery() {
  return useQuery({ queryKey: productKeys.all, queryFn: listProducts });
}

export function useSaveProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ product, input }: SaveProductVariables) =>
      product ? updateProduct(product.id, input) : createProduct(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
      ]);
    },
  });
}

export function useProductStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Product) =>
      product.isActive
        ? deactivateProduct(product.id)
        : activateProduct(product.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
      ]);
    },
  });
}
