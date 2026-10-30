import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryKeys } from "@/features/inventory/inventory-api";
import { productKeys } from "@/features/products/api/products-api";
import {
  createStockMovement,
  listStockMovements,
  stockMovementKeys,
} from "../api/stock-movements-api";

export function useStockMovementHistoryQuery(productId: string) {
  return useQuery({
    enabled: productId.length > 0,
    queryKey: stockMovementKeys.history(productId),
    queryFn: () => listStockMovements(productId),
  });
}

export function useCreateStockMovementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStockMovement,
    onSuccess: async (movement) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: stockMovementKeys.history(movement.productId),
        }),
      ]);
    },
  });
}
