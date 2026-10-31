import { apiRequest } from "@/lib/api";

export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type InventoryItem = {
  productId: string;
  sku: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  stock: number;
  minStock: number;
  status: InventoryStatus;
};

export type InventorySummary = {
  totalProducts: number;
  totalUnits: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
};

export const inventoryKeys = {
  all: ["inventory"] as const,
  summary: ["inventory", "summary"] as const,
};

export function listInventory() {
  return apiRequest<InventoryItem[]>("inventory");
}

export function getInventorySummary() {
  return apiRequest<InventorySummary>("inventory/summary");
}
