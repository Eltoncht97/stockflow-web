import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Category } from "@/features/categories/categories-api";
import { ApiClientError } from "@/lib/api";
import type { Product } from "../types/product";
import { ProductsPage } from "./products-page";

const mocks = vi.hoisted(() => ({
  activateProduct: vi.fn(),
  createProduct: vi.fn(),
  deactivateProduct: vi.fn(),
  listCategories: vi.fn(),
  listProducts: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  updateProduct: vi.fn(),
}));

vi.mock("../api/products-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/products-api")>()),
  activateProduct: mocks.activateProduct,
  createProduct: mocks.createProduct,
  deactivateProduct: mocks.deactivateProduct,
  listProducts: mocks.listProducts,
  updateProduct: mocks.updateProduct,
}));

vi.mock("@/features/categories/categories-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/categories/categories-api")>()),
  listCategories: mocks.listCategories,
}));

vi.mock("sonner", () => ({
  toast: { error: mocks.toastError, success: mocks.toastSuccess },
}));

const categories: Category[] = [
  { id: "hardware", name: "Hardware", description: null, createdAt: "2026-10-25T10:00:00.000Z", updatedAt: "2026-10-25T10:00:00.000Z" },
  { id: "accessories", name: "Accesorios", description: null, createdAt: "2026-10-25T10:00:00.000Z", updatedAt: "2026-10-25T10:00:00.000Z" },
];

const products: Product[] = [
  { id: "keyboard", sku: "KEY-001", name: "Teclado", description: "Mecánico", price: "49.90", stock: 2, minStock: 3, isActive: true, categoryId: "hardware", category: { id: "hardware", name: "Hardware" }, createdAt: "2026-10-25T10:00:00.000Z", updatedAt: "2026-10-25T10:00:00.000Z" },
  { id: "mouse", sku: "MOU-002", name: "Mouse", description: null, price: "20.00", stock: 0, minStock: 0, isActive: false, categoryId: "accessories", category: { id: "accessories", name: "Accesorios" }, createdAt: "2026-10-25T10:00:00.000Z", updatedAt: "2026-10-25T10:00:00.000Z" },
  { id: "monitor", sku: "MON-003", name: "Monitor", description: null, price: "250.00", stock: 10, minStock: 2, isActive: true, categoryId: "hardware", category: { id: "hardware", name: "Hardware" }, createdAt: "2026-10-25T10:00:00.000Z", updatedAt: "2026-10-25T10:00:00.000Z" },
];

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}><ProductsPage /></QueryClientProvider>);
}

describe("ProductsPage", () => {
  beforeEach(() => {
    mocks.listProducts.mockResolvedValue(products);
    mocks.listCategories.mockResolvedValue(categories);
  });

  afterEach(() => vi.clearAllMocks());

  it("renders loading, mobile cards, desktop table, and stock states", async () => {
    mocks.listProducts.mockReturnValueOnce(new Promise(() => undefined));
    renderPage();
    expect(screen.getByRole("status")).toHaveTextContent("Cargando productos...");
  });

  it("renders the product list in responsive presentations", async () => {
    renderPage();
    expect(await screen.findAllByText("Teclado")).toHaveLength(2);
    expect(screen.getByTestId("product-cards")).toHaveClass("md:hidden");
    expect(screen.getByTestId("product-table")).toHaveClass("hidden", "md:block");
    expect(screen.getAllByText("Stock bajo")).toHaveLength(2);
    expect(screen.getAllByText("Sin stock")).toHaveLength(2);
    expect(screen.getAllByText("Stock normal")).toHaveLength(2);
  });

  it("shows a distinct empty state", async () => {
    mocks.listProducts.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByRole("heading", { name: "Todavía no hay productos" })).toBeInTheDocument();
  });

  it.each([
    ["Teclado", "Mouse"],
    ["KEY-001", "Mouse"],
  ])("searches products with %s", async (term, hiddenProduct) => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("Teclado");
    await user.type(screen.getByRole("searchbox", { name: "Buscar productos" }), term);
    expect(screen.queryByText(hiddenProduct, { exact: true })).not.toBeInTheDocument();
    expect(screen.getAllByText("Teclado")).toHaveLength(2);
  });

  it("filters by category and status and shows no-results separately", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText("Teclado");
    await user.selectOptions(screen.getByRole("combobox", { name: "Filtrar por categoría" }), "accessories");
    expect(screen.getAllByText("Mouse")).toHaveLength(2);
    expect(screen.queryByText("Teclado", { exact: true })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox", { name: "Filtrar por estado" }), "active");
    expect(screen.getByRole("heading", { name: "No se encontraron resultados" })).toBeInTheDocument();
  });

  it("creates a product with the backend contract", async () => {
    const user = userEvent.setup();
    mocks.createProduct.mockResolvedValue(products[0]);
    renderPage();
    await screen.findAllByText("Teclado");
    await user.click(screen.getByRole("button", { name: "Nuevo producto" }));
    await user.type(screen.getByRole("textbox", { name: "Nombre" }), "  Parlantes  ");
    await user.type(screen.getByRole("textbox", { name: "SKU" }), "  SPE-004  ");
    await user.selectOptions(screen.getByRole("combobox", { name: "Categoría" }), "accessories");
    await user.type(screen.getByRole("textbox", { name: "Precio" }), "80.50");
    const minStock = screen.getByRole("spinbutton", { name: "Stock mínimo" });
    await user.clear(minStock);
    await user.type(minStock, "4");
    await user.click(screen.getByRole("button", { name: "Crear producto" }));
    await waitFor(() => expect(mocks.createProduct).toHaveBeenCalledWith({ name: "Parlantes", sku: "SPE-004", description: null, categoryId: "accessories", price: "80.50", minStock: 4 }));
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Producto creado correctamente.");
  });

  it("disables the form while product creation is pending", async () => {
    const user = userEvent.setup();
    let resolveCreate: (product: Product) => void = () => undefined;
    mocks.createProduct.mockReturnValue(
      new Promise<Product>((resolve) => {
        resolveCreate = resolve;
      }),
    );
    renderPage();
    await screen.findAllByText("Teclado");

    await user.click(screen.getByRole("button", { name: "Nuevo producto" }));
    await user.type(screen.getByRole("textbox", { name: "Nombre" }), "Parlantes");
    await user.type(screen.getByRole("textbox", { name: "SKU" }), "SPE-004");
    await user.selectOptions(screen.getByRole("combobox", { name: "Categoría" }), "accessories");
    await user.type(screen.getByRole("textbox", { name: "Precio" }), "80.50");
    await user.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();

    resolveCreate(products[0]);
    await waitFor(() => {
      expect(mocks.toastSuccess).toHaveBeenCalledWith(
        "Producto creado correctamente.",
      );
    });
  });

  it("keeps the form open and shows a duplicate SKU near the field", async () => {
    const user = userEvent.setup();
    mocks.createProduct.mockRejectedValue(new ApiClientError("Technical", 409));
    renderPage();
    await screen.findAllByText("Teclado");
    await user.click(screen.getByRole("button", { name: "Nuevo producto" }));
    await user.type(screen.getByRole("textbox", { name: "Nombre" }), "Otro");
    await user.type(screen.getByRole("textbox", { name: "SKU" }), "KEY-001");
    await user.selectOptions(screen.getByRole("combobox", { name: "Categoría" }), "hardware");
    await user.type(screen.getByRole("textbox", { name: "Precio" }), "10.00");
    await user.click(screen.getByRole("button", { name: "Crear producto" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Ya existe un producto con ese SKU.");
    expect(screen.getByRole("textbox", { name: "SKU" })).toHaveAttribute(
      "aria-describedby",
      "product-sku-error",
    );
    expect(mocks.toastError).toHaveBeenCalledWith("Ya existe un producto con ese SKU.");
  });

  it("clears a duplicate SKU error when the user changes the SKU", async () => {
    const user = userEvent.setup();
    mocks.createProduct.mockRejectedValue(new ApiClientError("Technical", 409));
    renderPage();
    await screen.findAllByText("Teclado");
    await user.click(screen.getByRole("button", { name: "Nuevo producto" }));
    await user.type(screen.getByRole("textbox", { name: "Nombre" }), "Otro");
    const sku = screen.getByRole("textbox", { name: "SKU" });
    await user.type(sku, "KEY-001");
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Categoría" }),
      "hardware",
    );
    await user.type(screen.getByRole("textbox", { name: "Precio" }), "10.00");
    await user.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ya existe un producto con ese SKU.",
    );

    await user.type(sku, "-NEW");

    expect(
      screen.queryByText("Ya existe un producto con ese SKU."),
    ).not.toBeInTheDocument();
    expect(sku).toHaveAttribute("aria-invalid", "false");
    expect(sku).not.toHaveAttribute("aria-describedby");
  });

  it("edits only supported product fields", async () => {
    const user = userEvent.setup();
    mocks.updateProduct.mockResolvedValue({ ...products[0], name: "Teclado Pro" });
    renderPage();
    await screen.findAllByText("Teclado");
    await user.click(screen.getAllByRole("button", { name: "Editar Teclado" })[0]);
    const name = screen.getByRole("textbox", { name: "Nombre" });
    await user.clear(name);
    await user.type(name, "Teclado Pro");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() => expect(mocks.updateProduct).toHaveBeenCalledWith("keyboard", expect.objectContaining({ name: "Teclado Pro", sku: "KEY-001", minStock: 3 })));
    expect(mocks.updateProduct.mock.calls[0][1]).not.toHaveProperty("stock");
    expect(mocks.updateProduct.mock.calls[0][1]).not.toHaveProperty("isActive");
  });

  it("deactivates a product after confirmation", async () => {
    const user = userEvent.setup();
    mocks.deactivateProduct.mockResolvedValue({ ...products[0], isActive: false });
    renderPage();
    await screen.findAllByText("Teclado");
    await user.click(screen.getAllByRole("button", { name: "Desactivar Teclado" })[0]);
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Desactivar producto" }));
    await waitFor(() => expect(mocks.deactivateProduct).toHaveBeenCalledWith("keyboard"));
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Producto desactivado correctamente.");
  });

  it("activates an inactive product after confirmation", async () => {
    const user = userEvent.setup();
    mocks.activateProduct.mockResolvedValue({ ...products[1], isActive: true });
    renderPage();
    await screen.findAllByText("Mouse");

    await user.click(screen.getAllByRole("button", { name: "Activar Mouse" })[0]);
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Activar producto" }));

    await waitFor(() => expect(mocks.activateProduct).toHaveBeenCalledWith("mouse"));
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Producto activado correctamente.",
    );
  });

  it("keeps the status dialog open when the mutation fails", async () => {
    const user = userEvent.setup();
    mocks.deactivateProduct.mockRejectedValue(
      new ApiClientError("Technical", 429),
    );
    renderPage();
    await screen.findAllByText("Teclado");

    await user.click(screen.getAllByRole("button", { name: "Desactivar Teclado" })[0]);
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Desactivar producto",
      }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Se realizaron demasiadas solicitudes",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(mocks.toastError).toHaveBeenCalledWith(
      "Se realizaron demasiadas solicitudes. Esperá un momento e intentá nuevamente.",
    );
  });

  it("shows a friendly load error", async () => {
    mocks.listProducts.mockRejectedValue(new ApiClientError("Technical", 500));
    renderPage();
    expect(await screen.findByRole("heading", { name: "No se pudieron cargar los productos" })).toBeInTheDocument();
    expect(screen.getByText(/servidor no pudo completar/i)).toBeInTheDocument();
  });

  it("retries both product and category queries after a load error", async () => {
    const user = userEvent.setup();
    mocks.listProducts
      .mockRejectedValueOnce(new ApiClientError("Technical", 500))
      .mockResolvedValue(products);
    renderPage();
    await screen.findByRole("heading", {
      name: "No se pudieron cargar los productos",
    });

    await user.click(screen.getByRole("button", { name: "Intentar nuevamente" }));

    expect(await screen.findAllByText("Teclado")).toHaveLength(2);
    expect(mocks.listProducts).toHaveBeenCalledTimes(2);
    expect(mocks.listCategories).toHaveBeenCalledTimes(2);
  });
});
