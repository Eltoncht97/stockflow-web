import { describe, expect, it } from "vitest";
import { productSchema, toProductInput } from "./product-schema";

const validProduct = {
  name: "  Teclado  ",
  sku: "  KEY-001  ",
  description: "  Mecánico  ",
  price: "49.90",
  minStock: "2",
  categoryId: "category-hardware",
};

describe("productSchema", () => {
  it("normalizes a valid form and creates the API payload", () => {
    const values = productSchema.parse(validProduct);

    expect(toProductInput(values)).toEqual({
      name: "Teclado",
      sku: "KEY-001",
      description: "Mecánico",
      price: "49.90",
      minStock: 2,
      categoryId: "category-hardware",
    });
  });

  it.each(["-1", "1.999", "10000000000.00", "abc"])(
    "rejects invalid price %s",
    (price) => {
      expect(productSchema.safeParse({ ...validProduct, price }).success).toBe(
        false,
      );
    },
  );

  it.each(["-1", "1.5", ""])("rejects invalid minimum stock %s", (minStock) => {
    expect(
      productSchema.safeParse({ ...validProduct, minStock }).success,
    ).toBe(false);
  });

  it("rejects minimum stock above the PostgreSQL integer limit", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      minStock: "2147483648",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.minStock).toContain(
        "El stock mínimo no puede superar 2147483647.",
      );
    }
  });

  it.each(["name", "sku", "categoryId"] as const)(
    "requires %s",
    (field) => {
      expect(
        productSchema.safeParse({ ...validProduct, [field]: "" }).success,
      ).toBe(false);
    },
  );

  it("maps an empty description to null without adding stock or status", () => {
    const values = productSchema.parse({
      ...validProduct,
      description: "   ",
    });

    const input = toProductInput(values);

    expect(input.description).toBeNull();
    expect(input).not.toHaveProperty("stock");
    expect(input).not.toHaveProperty("isActive");
  });
});
