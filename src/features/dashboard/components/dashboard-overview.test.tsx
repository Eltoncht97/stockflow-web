import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { InventorySummary } from "@/features/inventory/inventory-api";
import type { Product } from "@/features/products/types/product";
import { DashboardOverview } from "./dashboard-overview";

const mocks = vi.hoisted(() => ({
  getInventorySummary: vi.fn(),
  listProducts: vi.fn(),
}));

vi.mock("@/features/inventory/inventory-api", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("@/features/inventory/inventory-api")
  >()),
  getInventorySummary: mocks.getInventorySummary,
}));

vi.mock("@/features/products/api/products-api", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("@/features/products/api/products-api")
  >()),
  listProducts: mocks.listProducts,
}));

const products: Product[] = [
  {
    id: "keyboard",
    sku: "KEY-001",
    name: "Teclado",
    description: null,
    price: "1500.25",
    stock: 3,
    minStock: 2,
    isActive: true,
    categoryId: "hardware",
    category: { id: "hardware", name: "Hardware" },
    createdAt: "2026-10-30T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
  },
  {
    id: "inactive",
    sku: "OLD-002",
    name: "Producto anterior",
    description: null,
    price: "9999.00",
    stock: 20,
    minStock: 1,
    isActive: false,
    categoryId: "hardware",
    category: { id: "hardware", name: "Hardware" },
    createdAt: "2026-10-30T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
  },
];

const summary: InventorySummary = {
  totalProducts: 1,
  totalUnits: 3,
  inStockProducts: 0,
  lowStockProducts: 1,
  outOfStockProducts: 2,
};

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardOverview />
    </QueryClientProvider>,
  );
}

describe("DashboardOverview", () => {
  beforeEach(() => {
    mocks.listProducts.mockResolvedValue(products);
    mocks.getInventorySummary.mockResolvedValue(summary);
  });

  afterEach(() => vi.clearAllMocks());

  it("renders API metrics, low-stock behavior, and ARS inventory value", async () => {
    renderDashboard();

    expect(
      await screen.findByRole("link", { name: /Total de productos: 2/ }),
    ).toHaveAttribute("href", "/products");
    expect(
      screen.getByRole("link", { name: /Productos activos: 1/ }),
    ).toHaveAttribute("href", "/products");
    expect(
      screen.getByRole("link", { name: /Bajo stock: 3/ }),
    ).toHaveAttribute("href", "/inventory");
    expect(
      screen.getByRole("link", { name: /Valor del inventario:.*4\.500,75/ }),
    ).toHaveAttribute("href", "/inventory");
    expect(
      screen.getByText("Incluye productos con stock bajo o sin stock"),
    ).toBeInTheDocument();
  });

  it("shows a useful loading state", () => {
    mocks.listProducts.mockReturnValueOnce(new Promise(() => undefined));
    mocks.getInventorySummary.mockReturnValueOnce(new Promise(() => undefined));
    renderDashboard();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando resumen del inventario...",
    );
  });

  it("shows an intentional empty dashboard", async () => {
    mocks.listProducts.mockResolvedValue([]);
    mocks.getInventorySummary.mockResolvedValue({
      totalProducts: 0,
      totalUnits: 0,
      inStockProducts: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
    });
    renderDashboard();

    expect(
      await screen.findByRole("heading", {
        name: "Empezá a cargar tu inventario",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a productos" })).toHaveAttribute(
      "href",
      "/products",
    );
    expect(screen.getAllByText("0")).toHaveLength(3);
    expect(screen.getByText(/0,00/)).toBeInTheDocument();
  });

  it("keeps summary data usable when products fail", async () => {
    mocks.listProducts.mockRejectedValue(new Error("Database unavailable"));
    renderDashboard();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Algunos datos no están disponibles");
    expect(alert).not.toHaveTextContent("Database unavailable");
    expect(
      screen.getByRole("link", { name: /Total de productos: no disponible/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Productos activos: 1/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Bajo stock: 3/ }),
    ).toBeInTheDocument();
    expect(
      within(alert).getByRole("button", { name: "Intentar nuevamente" }),
    ).toBeInTheDocument();
  });

  it("keeps product data usable when the inventory summary fails", async () => {
    mocks.getInventorySummary.mockRejectedValue(
      new Error("Inventory summary unavailable"),
    );
    renderDashboard();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Algunos datos no están disponibles");
    expect(alert).not.toHaveTextContent("Inventory summary unavailable");
    expect(
      screen.getByRole("link", { name: /Total de productos: 2/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /Valor del inventario:.*4\.500,75/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Productos activos: no disponible/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Bajo stock: no disponible/ }),
    ).toBeInTheDocument();
  });

  it("shows a safe state when all dashboard requests fail", async () => {
    mocks.listProducts.mockRejectedValue(new Error("Products unavailable"));
    mocks.getInventorySummary.mockRejectedValue(
      new Error("Inventory summary unavailable"),
    );
    renderDashboard();

    const alert = await screen.findByRole("alert");
    expect(alert).not.toHaveTextContent("Products unavailable");
    expect(alert).not.toHaveTextContent("Inventory summary unavailable");
    expect(
      screen.getAllByRole("link", { name: /no disponible/ }),
    ).toHaveLength(4);
    expect(
      within(alert).getByRole("button", { name: "Intentar nuevamente" }),
    ).toBeInTheDocument();
  });

  it("explains the recent movement limitation and links to the available history", async () => {
    renderDashboard();
    await screen.findByRole("link", { name: /Total de productos: 2/ });

    expect(
      screen.getByRole("heading", { name: "Movimientos recientes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/El historial general no está disponible/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Consultar movimientos" }),
    ).toHaveAttribute("href", "/stock-movements");
  });
});
