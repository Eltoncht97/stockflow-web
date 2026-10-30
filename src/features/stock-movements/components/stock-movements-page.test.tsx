import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api";
import { inventoryKeys } from "@/features/inventory/inventory-api";
import { productKeys } from "@/features/products/api/products-api";
import type { Product } from "@/features/products/types/product";
import {
  stockMovementKeys,
  type StockMovement,
} from "../api/stock-movements-api";
import { StockMovementsPage } from "./stock-movements-page";

const mocks = vi.hoisted(() => ({
  createStockMovement: vi.fn(),
  listProducts: vi.fn(),
  listStockMovements: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock("@/features/products/api/products-api", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("@/features/products/api/products-api")
  >()),
  listProducts: mocks.listProducts,
}));

vi.mock("../api/stock-movements-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/stock-movements-api")>()),
  createStockMovement: mocks.createStockMovement,
  listStockMovements: mocks.listStockMovements,
}));

vi.mock("sonner", () => ({
  toast: { error: mocks.toastError, success: mocks.toastSuccess },
}));

const activeProductId = "8f8c1c2f-7d87-4fd2-b5b3-76ea40c0bb83";
const inactiveProductId = "6e4eb2ef-af93-4210-b6b3-910246bca7ec";

const products: Product[] = [
  {
    id: activeProductId,
    sku: "KEY-001",
    name: "Teclado",
    description: null,
    price: "50.00",
    stock: 5,
    minStock: 2,
    isActive: true,
    categoryId: "hardware",
    category: { id: "hardware", name: "Hardware" },
    createdAt: "2026-10-29T10:00:00.000Z",
    updatedAt: "2026-10-29T10:00:00.000Z",
  },
  {
    id: inactiveProductId,
    sku: "OLD-002",
    name: "Producto anterior",
    description: null,
    price: "20.00",
    stock: 1,
    minStock: 1,
    isActive: false,
    categoryId: "hardware",
    category: { id: "hardware", name: "Hardware" },
    createdAt: "2026-10-29T10:00:00.000Z",
    updatedAt: "2026-10-29T10:00:00.000Z",
  },
];

const movement: StockMovement = {
  id: "749be140-42fe-4ffd-a8b0-90d9bb859a3d",
  productId: activeProductId,
  type: "OUT",
  quantity: 2,
  reason: "Venta",
  createdAt: "2026-10-29T12:00:00.000Z",
};

const entryMovement: StockMovement = {
  id: "7b7e117f-bb30-4800-ab23-5333fea956d8",
  productId: activeProductId,
  type: "IN",
  quantity: 4,
  reason: "Reposición",
  createdAt: "2026-10-29T11:00:00.000Z",
};

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, reject, resolve };
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return {
    client,
    ...render(
    <QueryClientProvider client={client}>
      <StockMovementsPage />
    </QueryClientProvider>,
    ),
  };
}

describe("StockMovementsPage", () => {
  beforeEach(() => {
    mocks.listProducts.mockResolvedValue(products);
    mocks.listStockMovements.mockResolvedValue([movement]);
  });

  afterEach(() => vi.clearAllMocks());

  it("shows the product loading state", () => {
    mocks.listProducts.mockReturnValueOnce(new Promise(() => undefined));
    renderPage();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando productos...",
    );
  });

  it("shows a safe product API error state", async () => {
    mocks.listProducts.mockRejectedValue(
      new ApiClientError("Database unavailable", 500),
    );
    renderPage();

    expect(
      await screen.findByRole("heading", {
        name: "No se pudieron cargar los productos",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Database unavailable")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Intentar nuevamente" }),
    ).toBeInTheDocument();
  });

  it("shows the zero-products state and disables movement creation", async () => {
    mocks.listProducts.mockResolvedValue([]);
    renderPage();

    expect(
      await screen.findByRole("heading", { name: "Todavía no hay productos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Nuevo movimiento" }),
    ).toBeDisabled();
  });

  it("shows when there are no active products", async () => {
    mocks.listProducts.mockResolvedValue([products[1]]);
    renderPage();

    expect(
      await screen.findByText(
        "No hay productos activos para registrar movimientos.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Nuevo movimiento" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("combobox", { name: "Producto" }),
    ).toHaveAccessibleName("Producto");
  });

  it("uses active products for creation and all products for history", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(
      await screen.findByRole("button", { name: "Nuevo movimiento" }),
    );
    const dialog = screen.getByRole("dialog");
    const formProduct = within(dialog).getByRole("combobox", {
      name: "Producto",
    });

    expect(within(formProduct).getByRole("option", { name: /Teclado/ })).toBeInTheDocument();
    expect(
      within(formProduct).queryByRole("option", { name: /Producto anterior/ }),
    ).not.toBeInTheDocument();
    const historyProduct = document.getElementById(
      "stock-movement-history-product",
    );
    expect(historyProduct).toContainHTML("Producto anterior");
  });

  it("loads per-product history in responsive presentations", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Producto" }),
      activeProductId,
    );

    expect(await screen.findAllByText("Venta")).toHaveLength(2);
    expect(mocks.listStockMovements).toHaveBeenCalledWith(activeProductId);
    expect(screen.getByTestId("stock-movement-cards")).toHaveClass("lg:hidden");
    expect(screen.getByTestId("stock-movement-table")).toHaveClass(
      "hidden",
      "lg:block",
    );
  });

  it("filters history to entries", async () => {
    const user = userEvent.setup();
    mocks.listStockMovements.mockResolvedValue([movement, entryMovement]);
    renderPage();

    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Producto" }),
      activeProductId,
    );
    await screen.findAllByText("Venta");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Filtrar por tipo" }),
      "IN",
    );

    expect(screen.getAllByText("Reposición")).toHaveLength(2);
    expect(screen.queryByText("Venta", { exact: true })).not.toBeInTheDocument();
  });

  it("filters history to exits", async () => {
    const user = userEvent.setup();
    mocks.listStockMovements.mockResolvedValue([movement, entryMovement]);
    renderPage();

    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Producto" }),
      activeProductId,
    );
    await screen.findAllByText("Reposición");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Filtrar por tipo" }),
      "OUT",
    );

    expect(screen.getAllByText("Venta")).toHaveLength(2);
    expect(
      screen.queryByText("Reposición", { exact: true }),
    ).not.toBeInTheDocument();
  });

  it("shows a distinct state when the type filter has no results", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Producto" }),
      activeProductId,
    );
    await screen.findAllByText("Venta");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Filtrar por tipo" }),
      "IN",
    );

    expect(
      screen.getByRole("heading", {
        name: "No hay movimientos para este filtro",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Sin movimientos registrados" }),
    ).not.toBeInTheDocument();
  });

  it("shows an empty history state", async () => {
    const user = userEvent.setup();
    mocks.listStockMovements.mockResolvedValue([]);
    renderPage();

    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Producto" }),
      inactiveProductId,
    );

    expect(
      await screen.findByRole("heading", { name: "Sin movimientos registrados" }),
    ).toBeInTheDocument();
  });

  it("shows the history loading state", async () => {
    const user = userEvent.setup();
    mocks.listStockMovements.mockReturnValueOnce(new Promise(() => undefined));
    renderPage();

    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Producto" }),
      activeProductId,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando historial...",
    );
  });

  it("shows a safe history API error state", async () => {
    const user = userEvent.setup();
    mocks.listStockMovements.mockRejectedValue(
      new ApiClientError("Raw database error", 500),
    );
    renderPage();

    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Producto" }),
      activeProductId,
    );

    expect(
      await screen.findByRole("heading", {
        name: "No se pudo cargar el historial",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Raw database error")).not.toBeInTheDocument();
  });

  it("lets the backend decide an OUT quantity above cached stock", async () => {
    const user = userEvent.setup();
    mocks.createStockMovement.mockResolvedValue({
      ...movement,
      quantity: 6,
    });
    renderPage();
    await user.click(
      await screen.findByRole("button", { name: "Nuevo movimiento" }),
    );
    const dialog = screen.getByRole("dialog");

    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "Producto" }),
      activeProductId,
    );
    await user.click(within(dialog).getByRole("radio", { name: "Salida" }));
    await user.type(within(dialog).getByRole("spinbutton", { name: "Cantidad" }), "6");
    await user.type(within(dialog).getByRole("textbox", { name: "Motivo" }), "Venta");
    await user.click(within(dialog).getByRole("button", { name: "Registrar salida" }));

    await waitFor(() =>
      expect(mocks.createStockMovement).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 6, type: "OUT" }),
        expect.anything(),
      ),
    );
  });

  it("shows quantity validation before sending a movement", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(
      await screen.findByRole("button", { name: "Nuevo movimiento" }),
    );
    const dialog = screen.getByRole("dialog");

    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "Producto" }),
      activeProductId,
    );
    await user.type(
      within(dialog).getByRole("textbox", { name: "Motivo" }),
      "Ajuste",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Registrar entrada" }),
    );

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Ingresá una cantidad entera mayor que 0.",
    );
    expect(mocks.createStockMovement).not.toHaveBeenCalled();
  });

  it("creates a movement and opens the affected product history", async () => {
    const user = userEvent.setup();
    mocks.createStockMovement.mockResolvedValue(movement);
    const { client } = renderPage();
    const invalidateQueries = vi.spyOn(client, "invalidateQueries");
    await user.click(
      await screen.findByRole("button", { name: "Nuevo movimiento" }),
    );
    const dialog = screen.getByRole("dialog");

    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "Producto" }),
      activeProductId,
    );
    await user.click(within(dialog).getByRole("radio", { name: "Salida" }));
    await user.type(within(dialog).getByRole("spinbutton", { name: "Cantidad" }), "2");
    await user.type(within(dialog).getByRole("textbox", { name: "Motivo" }), "  Venta  ");
    await user.click(within(dialog).getByRole("button", { name: "Registrar salida" }));

    await waitFor(() =>
      expect(mocks.createStockMovement).toHaveBeenCalledWith(
        {
          productId: activeProductId,
          type: "OUT",
          quantity: 2,
          reason: "Venta",
        },
        expect.anything(),
      ),
    );
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Salida registrada correctamente.",
    );
    expect(invalidateQueries).toHaveBeenCalledTimes(3);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: productKeys.all,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: inventoryKeys.all,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: stockMovementKeys.history(activeProductId),
    });
    expect(
      screen.getByRole("combobox", { name: "Producto" }),
    ).toHaveValue(activeProductId);
    await waitFor(() =>
      expect(mocks.listStockMovements).toHaveBeenCalledWith(activeProductId),
    );
  });

  it("resets an opposite type filter after creating a movement", async () => {
    const user = userEvent.setup();
    mocks.createStockMovement.mockResolvedValue(movement);
    renderPage();

    await user.selectOptions(
      await screen.findByRole("combobox", { name: "Producto" }),
      activeProductId,
    );
    await screen.findAllByText("Venta");
    const typeFilter = screen.getByRole("combobox", {
      name: "Filtrar por tipo",
    });
    await user.selectOptions(typeFilter, "IN");
    expect(
      screen.getByRole("heading", {
        name: "No hay movimientos para este filtro",
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Nuevo movimiento" }));
    const dialog = screen.getByRole("dialog");
    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "Producto" }),
      activeProductId,
    );
    await user.click(within(dialog).getByRole("radio", { name: "Salida" }));
    await user.type(
      within(dialog).getByRole("spinbutton", { name: "Cantidad" }),
      "2",
    );
    await user.type(
      within(dialog).getByRole("textbox", { name: "Motivo" }),
      "Venta",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Registrar salida" }),
    );

    await waitFor(() => expect(typeFilter).toHaveValue("all"));
    expect(await screen.findAllByText("Venta")).toHaveLength(2);
  });

  it("creates an IN movement and shows success feedback", async () => {
    const user = userEvent.setup();
    mocks.createStockMovement.mockResolvedValue({
      ...movement,
      type: "IN",
    });
    renderPage();
    await user.click(
      await screen.findByRole("button", { name: "Nuevo movimiento" }),
    );
    const dialog = screen.getByRole("dialog");

    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "Producto" }),
      activeProductId,
    );
    await user.type(
      within(dialog).getByRole("spinbutton", { name: "Cantidad" }),
      "2",
    );
    await user.type(
      within(dialog).getByRole("textbox", { name: "Motivo" }),
      "Reposición",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Registrar entrada" }),
    );

    await waitFor(() =>
      expect(mocks.createStockMovement).toHaveBeenCalledWith(
        expect.objectContaining({ type: "IN" }),
        expect.anything(),
      ),
    );
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Entrada registrada correctamente.",
    );
  });

  it("disables the movement form while the mutation is pending", async () => {
    const user = userEvent.setup();
    const deferred = createDeferred<StockMovement>();
    mocks.createStockMovement.mockReturnValue(deferred.promise);
    renderPage();
    await user.click(
      await screen.findByRole("button", { name: "Nuevo movimiento" }),
    );
    const dialog = screen.getByRole("dialog");

    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "Producto" }),
      activeProductId,
    );
    await user.type(
      within(dialog).getByRole("spinbutton", { name: "Cantidad" }),
      "1",
    );
    await user.type(
      within(dialog).getByRole("textbox", { name: "Motivo" }),
      "Reposición",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Registrar entrada" }),
    );

    expect(
      within(dialog).getByRole("button", { name: "Registrando..." }),
    ).toBeDisabled();
    expect(
      within(dialog).getByRole("combobox", { name: "Producto" }),
    ).toBeDisabled();

    deferred.resolve({ ...movement, type: "IN" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("shows a safe insufficient-stock conflict", async () => {
    const user = userEvent.setup();
    mocks.createStockMovement.mockRejectedValue(
      new ApiClientError("Insufficient stock", 409),
    );
    renderPage();
    await user.click(
      await screen.findByRole("button", { name: "Nuevo movimiento" }),
    );
    const dialog = screen.getByRole("dialog");

    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "Producto" }),
      activeProductId,
    );
    await user.click(within(dialog).getByRole("radio", { name: "Salida" }));
    await user.type(within(dialog).getByRole("spinbutton", { name: "Cantidad" }), "2");
    await user.type(within(dialog).getByRole("textbox", { name: "Motivo" }), "Venta");
    await user.click(within(dialog).getByRole("button", { name: "Registrar salida" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "no tener stock suficiente",
    );
    expect(within(dialog).queryByText("Insufficient stock")).not.toBeInTheDocument();
    expect(mocks.toastError).toHaveBeenCalledWith(
      expect.stringContaining("stock suficiente"),
    );
  });

  it("shows a safe generic mutation error", async () => {
    const user = userEvent.setup();
    mocks.createStockMovement.mockRejectedValue(
      new ApiClientError("Internal SQL error", 500),
    );
    renderPage();
    await user.click(
      await screen.findByRole("button", { name: "Nuevo movimiento" }),
    );
    const dialog = screen.getByRole("dialog");

    await user.selectOptions(
      within(dialog).getByRole("combobox", { name: "Producto" }),
      activeProductId,
    );
    await user.type(
      within(dialog).getByRole("spinbutton", { name: "Cantidad" }),
      "1",
    );
    await user.type(
      within(dialog).getByRole("textbox", { name: "Motivo" }),
      "Ajuste",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Registrar entrada" }),
    );

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "El servidor no pudo completar la operación.",
    );
    expect(within(dialog).queryByText("Internal SQL error")).not.toBeInTheDocument();
    expect(mocks.toastError).toHaveBeenCalledWith(
      expect.stringContaining("servidor"),
    );
  });
});
