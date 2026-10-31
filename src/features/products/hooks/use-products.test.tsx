import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { inventoryKeys } from "@/features/inventory/inventory-api";
import { productKeys } from "../api/products-api";
import type { Product, ProductInput } from "../types/product";
import {
  useProductStatusMutation,
  useSaveProductMutation,
} from "./use-products";

const mocks = vi.hoisted(() => ({
  activateProduct: vi.fn(),
  createProduct: vi.fn(),
  deactivateProduct: vi.fn(),
  updateProduct: vi.fn(),
}));

vi.mock("../api/products-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/products-api")>()),
  activateProduct: mocks.activateProduct,
  createProduct: mocks.createProduct,
  deactivateProduct: mocks.deactivateProduct,
  updateProduct: mocks.updateProduct,
}));

const input: ProductInput = {
  sku: "KEY-001",
  name: "Teclado",
  description: null,
  categoryId: "hardware",
  price: "1500.00",
  minStock: 2,
};

const product: Product = {
  id: "product-id",
  ...input,
  stock: 3,
  isActive: true,
  category: { id: "hardware", name: "Hardware" },
  createdAt: "2026-10-30T10:00:00.000Z",
  updatedAt: "2026-10-30T10:00:00.000Z",
};

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { invalidateQueries, wrapper };
}

describe("product mutation cache invalidation", () => {
  afterEach(() => vi.clearAllMocks());

  it("invalidates product and inventory data after creating a product", async () => {
    mocks.createProduct.mockResolvedValue(product);
    const { invalidateQueries, wrapper } = setup();
    const { result } = renderHook(useSaveProductMutation, { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ input });
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: productKeys.all,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: inventoryKeys.all,
    });
  });

  it("invalidates product and inventory data after updating a product", async () => {
    mocks.updateProduct.mockResolvedValue(product);
    const { invalidateQueries, wrapper } = setup();
    const { result } = renderHook(useSaveProductMutation, { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ input, product });
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: productKeys.all,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: inventoryKeys.all,
    });
  });

  it("invalidates product and inventory data after changing product status", async () => {
    mocks.deactivateProduct.mockResolvedValue({ ...product, isActive: false });
    const { invalidateQueries, wrapper } = setup();
    const { result } = renderHook(useProductStatusMutation, { wrapper });

    await act(async () => {
      await result.current.mutateAsync(product);
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: productKeys.all,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: inventoryKeys.all,
    });
  });
});
