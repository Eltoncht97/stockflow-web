import { expect, test, type Page } from "@playwright/test";

type ApiProduct = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  minStock: number;
  isActive: boolean;
  categoryId: string;
  category: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
};

const categories = [
  { id: "hardware", name: "Hardware", description: null, createdAt: "2026-10-25T10:00:00.000Z", updatedAt: "2026-10-25T10:00:00.000Z" },
  { id: "accessories", name: "Accesorios", description: null, createdAt: "2026-10-25T10:00:00.000Z", updatedAt: "2026-10-25T10:00:00.000Z" },
];

function product(id: string, name: string, sku: string, categoryId = "hardware"): ApiProduct {
  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  return { id, name, sku, description: null, price: "49.90", stock: 2, minStock: 3, isActive: true, categoryId, category: { id: category.id, name: category.name }, createdAt: "2026-10-25T10:00:00.000Z", updatedAt: "2026-10-25T10:00:00.000Z" };
}

async function mockApi(
  page: Page,
  options: { rejectCreateWithConflict?: boolean } = {},
) {
  let products = [product("keyboard", "Teclado", "KEY-001"), product("mouse", "Mouse", "MOU-002", "accessories")];
  await page.route("http://stockflow-api.test/categories**", (route) => route.fulfill({ json: categories }));
  await page.route("http://stockflow-api.test/products**", async (route) => {
    const request = route.request();
    const parts = new URL(request.url()).pathname.split("/").filter(Boolean);
    const id = parts[1];
    const action = parts[2];
    if (request.method() === "GET") return route.fulfill({ json: products });
    if (request.method() === "POST") {
      if (options.rejectCreateWithConflict) {
        return route.fulfill({
          json: {
            message: "A product with this SKU already exists",
            statusCode: 409,
          },
          status: 409,
        });
      }
      const body = request.postDataJSON() as Omit<ApiProduct, "id">;
      const created = { ...product("created", body.name, body.sku, body.categoryId), ...body, stock: 0, isActive: true };
      products = [...products, created];
      return route.fulfill({ json: created, status: 201 });
    }
    if (request.method() === "PATCH" && id && action) {
      if (request.postData()) {
        return route.fulfill({ status: 400 });
      }
      const current = products.find((item) => item.id === id)!;
      const updated = { ...current, isActive: action === "activate" };
      products = products.map((item) => item.id === id ? updated : item);
      return route.fulfill({ json: updated });
    }
    if (request.method() === "PATCH" && id) {
      const body = request.postDataJSON() as Partial<ApiProduct>;
      const current = products.find((item) => item.id === id)!;
      const category = categories.find((item) => item.id === body.categoryId) ?? current.category;
      const updated = { ...current, ...body, category: { id: category.id, name: category.name } };
      products = products.map((item) => item.id === id ? updated : item);
      return route.fulfill({ json: updated });
    }
    return route.fulfill({ status: 400 });
  });
}

test("completes the main product workflow", async ({ page }, testInfo) => {
  await mockApi(page);
  await page.goto("/products");
  const visibleList = testInfo.project.name.startsWith("mobile") ? page.getByTestId("product-cards") : page.getByTestId("product-table");
  await expect(page.getByRole("heading", { level: 1, name: "Productos" })).toBeVisible();
  await page.getByRole("searchbox", { name: "Buscar productos" }).fill("KEY-001");
  await expect(visibleList.getByText("Teclado", { exact: true })).toBeVisible();
  await expect(page.getByText("Mouse", { exact: true })).toHaveCount(0);
  await page.getByRole("searchbox", { name: "Buscar productos" }).clear();
  await page.getByRole("searchbox", { name: "Buscar productos" }).fill("mouse");
  await expect(visibleList.getByText("Mouse", { exact: true })).toBeVisible();
  await expect(page.getByText("Teclado", { exact: true })).toHaveCount(0);
  await page.getByRole("searchbox", { name: "Buscar productos" }).clear();

  await page.getByRole("combobox", { name: "Filtrar por categoría" }).selectOption("accessories");
  await expect(visibleList.getByText("Mouse", { exact: true })).toBeVisible();
  await expect(page.getByText("Teclado", { exact: true })).toHaveCount(0);
  await page.getByRole("combobox", { name: "Filtrar por categoría" }).selectOption("all");

  await page.getByRole("button", { name: "Nuevo producto" }).click();
  await page.getByRole("textbox", { name: "Nombre" }).fill("Parlantes");
  await page.getByRole("textbox", { name: "SKU" }).fill("SPE-003");
  await page.getByRole("combobox", { name: "Categoría" }).selectOption("accessories");
  await page.getByRole("textbox", { name: "Precio" }).fill("80.00");
  await page.getByRole("spinbutton", { name: "Stock mínimo" }).fill("4");
  await page.getByRole("button", { name: "Crear producto" }).click();
  await expect(page.getByText("Producto creado correctamente.")).toBeVisible();
  await expect(visibleList.getByText("Parlantes", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Editar Parlantes" }).click();
  await page.getByRole("textbox", { name: "Nombre" }).fill("Parlantes Pro");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Producto actualizado correctamente.")).toBeVisible();
  await expect(visibleList.getByText("Parlantes Pro", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Desactivar Parlantes Pro" }).click();
  await page.getByRole("button", { name: "Desactivar producto" }).click();
  await expect(page.getByText("Producto desactivado correctamente.")).toBeVisible();
  await page.getByRole("combobox", { name: "Filtrar por estado" }).selectOption("inactive");
  await expect(visibleList.getByText("Parlantes Pro", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Activar Parlantes Pro" }).click();
  await page.getByRole("button", { name: "Activar producto" }).click();
  await expect(page.getByText("Producto activado correctamente.")).toBeVisible();
  await page.getByRole("combobox", { name: "Filtrar por estado" }).selectOption("active");
  await expect(visibleList.getByText("Parlantes Pro", { exact: true })).toBeVisible();
});

test("shows a duplicate SKU conflict next to the form field", async ({ page }) => {
  await mockApi(page, { rejectCreateWithConflict: true });
  await page.goto("/products");

  await page.getByRole("button", { name: "Nuevo producto" }).click();
  await page.getByRole("textbox", { name: "Nombre" }).fill("Otro teclado");
  await page.getByRole("textbox", { name: "SKU" }).fill("KEY-001");
  await page.getByRole("combobox", { name: "Categoría" }).selectOption("hardware");
  await page.getByRole("textbox", { name: "Precio" }).fill("25.00");
  await page.getByRole("button", { name: "Crear producto" }).click();

  await expect(
    page.getByRole("alert").filter({
      hasText: "Ya existe un producto con ese SKU.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "SKU" })).toHaveAttribute(
    "aria-describedby",
    "product-sku-error",
  );
});

test("uses cards on mobile and a table on desktop", async ({ page }, testInfo) => {
  await mockApi(page);
  await page.goto("/products");
  if (testInfo.project.name.startsWith("mobile")) {
    await expect(page.getByTestId("product-cards")).toBeVisible();
    await expect(page.getByTestId("product-table")).toBeHidden();
  } else {
    await expect(page.getByTestId("product-cards")).toBeHidden();
    await expect(page.getByTestId("product-table")).toBeVisible();
  }
});
