import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/lib/api";
import { inventoryKeys } from "@/features/inventory/inventory-api";
import type { Category } from "./categories-api";
import { CategoriesPage } from "./categories-page";

const mocks = vi.hoisted(() => ({
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
  listCategories: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  updateCategory: vi.fn(),
}));

vi.mock("./categories-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./categories-api")>();

  return {
    ...actual,
    createCategory: mocks.createCategory,
    deleteCategory: mocks.deleteCategory,
    listCategories: mocks.listCategories,
    updateCategory: mocks.updateCategory,
  };
});

vi.mock("sonner", () => ({
  toast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

const categories: Category[] = [
  {
    id: "category-hardware",
    name: "Hardware",
    description: null,
    createdAt: "2026-10-25T10:00:00.000Z",
    updatedAt: "2026-10-25T10:00:00.000Z",
  },
  {
    id: "category-tools",
    name: "Tools",
    description: null,
    createdAt: "2026-10-25T11:00:00.000Z",
    updatedAt: "2026-10-25T11:00:00.000Z",
  },
];

function renderCategoriesPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  const view = render(
    <QueryClientProvider client={queryClient}>
      <CategoriesPage />
    </QueryClientProvider>,
  );

  return { ...view, queryClient };
}

describe("CategoriesPage", () => {
  beforeEach(() => {
    mocks.listCategories.mockResolvedValue(categories);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows a loading state", () => {
    mocks.listCategories.mockReturnValue(new Promise(() => undefined));

    renderCategoriesPage();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando categorías...",
    );
  });

  it("renders categories as mobile cards and a desktop table", async () => {
    renderCategoriesPage();

    expect(await screen.findAllByText("Hardware")).toHaveLength(2);
    expect(screen.getAllByText("25/10/2026")).toHaveLength(2);
    expect(screen.getByTestId("category-cards")).toHaveClass("md:hidden");
    expect(screen.getByTestId("category-table")).toHaveClass(
      "hidden",
      "md:block",
    );
  });

  it("shows the empty state", async () => {
    mocks.listCategories.mockResolvedValue([]);

    renderCategoriesPage();

    expect(
      await screen.findByRole("heading", { name: "Todavía no hay categorías" }),
    ).toBeInTheDocument();
  });

  it("filters categories by name on the client", async () => {
    const user = userEvent.setup();
    renderCategoriesPage();
    await screen.findAllByText("Hardware");

    await user.type(screen.getByRole("searchbox", { name: "Buscar categorías" }), "tool");

    expect(screen.queryByText("Hardware")).not.toBeInTheDocument();
    expect(screen.getAllByText("Tools")).toHaveLength(2);
    expect(mocks.listCategories).toHaveBeenCalledTimes(1);
  });

  it("shows a friendly API error and retry action", async () => {
    mocks.listCategories.mockRejectedValue(
      new ApiClientError("Technical error", 500),
    );

    renderCategoriesPage();

    expect(
      await screen.findByRole("heading", {
        name: "No se pudieron cargar las categorías",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/servidor no pudo completar/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Intentar nuevamente" }),
    ).toBeInTheDocument();
  });

  it("creates a category and exposes the pending state", async () => {
    const user = userEvent.setup();
    let resolveCreate: (category: Category) => void = () => undefined;
    mocks.createCategory.mockReturnValue(
      new Promise<Category>((resolve) => {
        resolveCreate = resolve;
      }),
    );
    const { queryClient } = renderCategoriesPage();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    await screen.findAllByText("Hardware");

    await user.click(screen.getByRole("button", { name: "Nueva categoría" }));
    await user.type(screen.getByRole("textbox", { name: "Nombre" }), "  Oficina  ");
    await user.click(screen.getByRole("button", { name: "Crear categoría" }));

    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
    expect(mocks.createCategory).toHaveBeenCalledWith({ name: "Oficina" });

    resolveCreate({ ...categories[0], id: "category-office", name: "Oficina" });
    await waitFor(() => {
      expect(mocks.toastSuccess).toHaveBeenCalledWith(
        "Categoría creada correctamente.",
      );
    });
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: ["products"],
    });
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: inventoryKeys.all,
    });
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: inventoryKeys.list,
    });
  });

  it("keeps the form open and shows a duplicate-name conflict", async () => {
    const user = userEvent.setup();
    mocks.createCategory.mockRejectedValue(
      new ApiClientError("Technical error", 409),
    );
    renderCategoriesPage();
    await screen.findAllByText("Hardware");

    await user.click(screen.getByRole("button", { name: "Nueva categoría" }));
    await user.type(screen.getByRole("textbox", { name: "Nombre" }), "Hardware");
    await user.click(screen.getByRole("button", { name: "Crear categoría" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ya existe una categoría con ese nombre.",
    );
    expect(mocks.toastError).toHaveBeenCalledWith(
      "Ya existe una categoría con ese nombre.",
    );
  });

  it("edits a category", async () => {
    const user = userEvent.setup();
    mocks.updateCategory.mockResolvedValue({
      ...categories[0],
      name: "Equipos",
    });
    const { queryClient } = renderCategoriesPage();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    await screen.findAllByText("Hardware");

    await user.click(
      screen.getAllByRole("button", { name: "Editar Hardware" })[0],
    );
    const nameInput = screen.getByRole("textbox", { name: "Nombre" });
    await user.clear(nameInput);
    await user.type(nameInput, "Equipos");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(mocks.updateCategory).toHaveBeenCalledWith("category-hardware", {
        name: "Equipos",
      });
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Categoría actualizada correctamente.",
    );
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["products"],
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: inventoryKeys.list,
    });
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: inventoryKeys.all,
    });
    expect(invalidateQueries).toHaveBeenCalledTimes(3);
  });

  it("deletes a category after confirmation", async () => {
    const user = userEvent.setup();
    mocks.deleteCategory.mockResolvedValue(undefined);
    const { queryClient } = renderCategoriesPage();
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    await screen.findAllByText("Hardware");

    await user.click(
      screen.getAllByRole("button", { name: "Eliminar Hardware" })[0],
    );
    expect(
      screen.getByText(/¿Querés eliminar la categoría/i),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Eliminar categoría" }),
    );

    await waitFor(() => {
      expect(mocks.deleteCategory).toHaveBeenCalledWith("category-hardware");
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Categoría eliminada correctamente.",
    );
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: ["products"],
    });
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: inventoryKeys.all,
    });
    expect(invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: inventoryKeys.list,
    });
  });
});
