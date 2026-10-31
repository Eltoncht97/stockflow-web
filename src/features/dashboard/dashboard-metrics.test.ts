import { describe, expect, it } from "vitest";
import type { Product } from "@/features/products/types/product";
import {
  calculateInventoryValueInCents,
  formatInventoryValue,
} from "./dashboard-metrics";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "product-id",
    sku: "SKU-001",
    name: "Producto",
    description: null,
    price: "10.00",
    stock: 2,
    minStock: 1,
    isActive: true,
    categoryId: "category-id",
    category: { id: "category-id", name: "Categoría" },
    createdAt: "2026-10-30T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    ...overrides,
  };
}

describe("dashboard metrics", () => {
  it("calculates active inventory value in exact cents", () => {
    const products = [
      product({ price: "10.25", stock: 3 }),
      product({ id: "second", price: "0.10", stock: 2 }),
      product({ id: "inactive", price: "999.00", isActive: false }),
    ];

    expect(calculateInventoryValueInCents(products)).toBe(BigInt(3_095));
  });

  it("handles empty inventory and formats Argentine pesos", () => {
    expect(calculateInventoryValueInCents([])).toBe(BigInt(0));
    expect(formatInventoryValue(BigInt(575_050))).toBe("$\u00a05.750,50");
  });
});
