import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Category } from "@/features/categories/categories-api";
import type { InventoryItem } from "./inventory-api";
import { InventoryPage } from "./inventory-page";

const mocks = vi.hoisted(() => ({
  listCategories: vi.fn(),
  listInventory: vi.fn(),
}));

vi.mock("./inventory-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./inventory-api")>()),
  listInventory: mocks.listInventory,
}));

vi.mock("@/features/categories/categories-api", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("@/features/categories/categories-api")
  >()),
  listCategories: mocks.listCategories,
}));

const categories: Category[] = [
  {
    id: "hardware",
    name: "Hardware",
    description: null,
    createdAt: "2026-10-29T10:00:00.000Z",
    updatedAt: "2026-10-29T10:00:00.000Z",
  },
  {
    id: "accessories",
    name: "Accesorios",
    description: null,
    createdAt: "2026-10-29T10:00:00.000Z",
    updatedAt: "2026-10-29T10:00:00.000Z",
  },
];

const inventory: InventoryItem[] = [
  {
    productId: "keyboard",
    sku: "KEY-001",
    name: "Teclado",
    category: { id: "hardware", name: "Hardware" },
    stock: 2,
    minStock: 3,
    status: "LOW_STOCK",
  },
  {
    productId: "mouse",
    sku: "MOU-002",
    name: "Mouse",
    category: { id: "accessories", name: "Accesorios" },
    stock: 0,
    minStock: 2,
    status: "OUT_OF_STOCK",
  },
  {
    productId: "monitor",
    sku: "MON-003",
    name: "Monitor",
    category: { id: "hardware", name: "Hardware" },
    stock: 10,
    minStock: 2,
    status: "IN_STOCK",
  },
];

function renderPage() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <InventoryPage />
    </QueryClientProvider>,
  );
}

describe("InventoryPage", () => {
  beforeEach(() => {
    mocks.listCategories.mockResolvedValue(categories);
    mocks.listInventory.mockResolvedValue(inventory);
  });

  afterEach(() => vi.clearAllMocks());

  it("shows the loading state", () => {
    mocks.listInventory.mockReturnValueOnce(new Promise(() => undefined));
    renderPage();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando inventario...",
    );
  });

  it("renders responsive inventory views and backend stock statuses", async () => {
    renderPage();

    expect(await screen.findAllByText("Teclado")).toHaveLength(2);
    expect(screen.getByTestId("inventory-cards")).toHaveClass("lg:hidden");
    expect(screen.getByTestId("inventory-table")).toHaveClass(
      "hidden",
      "lg:block",
    );
    expect(screen.getAllByText("Stock bajo")).toHaveLength(2);
    expect(screen.getAllByText("Sin stock")).toHaveLength(2);
    expect(screen.getAllByText("Stock normal")).toHaveLength(2);
  });

  it("shows the empty inventory state", async () => {
    mocks.listInventory.mockResolvedValue([]);
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Todavía no hay inventario" }),
    ).toBeInTheDocument();
  });

  it("shows a safe API error state", async () => {
    mocks.listInventory.mockRejectedValue(new Error("Database unavailable"));
    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: "No se pudo cargar el inventario",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Database unavailable")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Intentar nuevamente" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["teclado", "Teclado", "Mouse"],
    ["MOU-002", "Mouse", "Teclado"],
  ])("searches by %s", async (term, visibleProduct, hiddenProduct) => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("Teclado");

    await user.type(
      screen.getByRole("searchbox", { name: "Buscar inventario" }),
      term,
    );

    expect(screen.getAllByText(visibleProduct)).toHaveLength(2);
    expect(
      screen.queryByText(hiddenProduct, { exact: true }),
    ).not.toBeInTheDocument();
  });

  it("filters by category", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("Teclado");

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "Filtrar inventario por categoría",
      }),
      "accessories",
    );

    expect(screen.getAllByText("Mouse")).toHaveLength(2);
    expect(screen.queryByText("Teclado", { exact: true })).not.toBeInTheDocument();
  });

  it("filters low and out-of-stock products using backend statuses", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("Teclado");

    await user.click(screen.getByRole("checkbox", { name: "Solo stock bajo" }));

    expect(screen.getAllByText("Teclado")).toHaveLength(2);
    expect(screen.getAllByText("Mouse")).toHaveLength(2);
    expect(screen.queryByText("Monitor", { exact: true })).not.toBeInTheDocument();
  });

  it("shows no results separately from empty inventory", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("Teclado");

    await user.type(
      screen.getByRole("searchbox", { name: "Buscar inventario" }),
      "producto inexistente",
    );

    expect(
      screen.getByRole("heading", { name: "No se encontraron resultados" }),
    ).toBeInTheDocument();
  });
});
