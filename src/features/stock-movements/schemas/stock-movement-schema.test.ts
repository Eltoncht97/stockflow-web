import { describe, expect, it } from "vitest";
import {
  stockMovementSchema,
  toStockMovementInput,
} from "./stock-movement-schema";

const productId = "8f8c1c2f-7d87-4fd2-b5b3-76ea40c0bb83";

describe("stockMovementSchema", () => {
  it("normalizes a valid movement", () => {
    const values = stockMovementSchema.parse({
      productId,
      type: "OUT",
      quantity: "3",
      reason: "  Producto dañado  ",
    });

    expect(toStockMovementInput(values)).toEqual({
      productId,
      type: "OUT",
      quantity: 3,
      reason: "Producto dañado",
    });
  });

  it.each(["", "0", "1.5", "2147483648"])(
    "rejects invalid quantity %s",
    (quantity) => {
      expect(
        stockMovementSchema.safeParse({
          productId,
          type: "IN",
          quantity,
          reason: "Reposición",
        }).success,
      ).toBe(false);
    },
  );

  it("rejects blank and oversized reasons", () => {
    for (const reason of ["   ", "a".repeat(256)]) {
      expect(
        stockMovementSchema.safeParse({
          productId,
          type: "IN",
          quantity: "1",
          reason,
        }).success,
      ).toBe(false);
    }
  });
});
