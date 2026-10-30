import { apiRequest } from "@/lib/api";

export type MovementType = "IN" | "OUT";

export type StockMovement = {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  createdAt: string;
};

export type StockMovementInput = {
  productId: string;
  type: MovementType;
  quantity: number;
  reason: string;
};

export const stockMovementKeys = {
  all: ["stock-movements"] as const,
  history: (productId: string) =>
    [...stockMovementKeys.all, productId] as const,
};

export function createStockMovement(input: StockMovementInput) {
  return apiRequest<StockMovement>("stock-movements", {
    method: "POST",
    body: input,
  });
}

export function listStockMovements(productId: string) {
  return apiRequest<StockMovement[]>(
    `products/${productId}/stock-movements`,
  );
}
