import { expect, test, type Page } from "@playwright/test";

const categories = [
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

const inventory = [
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

async function mockApi(page: Page) {
  await page.route("http://stockflow-api.test/inventory", (route) =>
    route.fulfill({ json: inventory, status: 200 }),
  );
  await page.route("http://stockflow-api.test/categories", (route) =>
    route.fulfill({ json: categories, status: 200 }),
  );
}

test("completes the main inventory filtering flow", async ({ page }, testInfo) => {
  await mockApi(page);
  await page.goto("/inventory");
  const visibleList = testInfo.project.name.startsWith("mobile")
    ? page.getByTestId("inventory-cards")
    : page.getByTestId("inventory-table");

  await expect(
    page.getByRole("heading", { level: 1, name: "Stock actual" }),
  ).toBeVisible();
  await expect(visibleList.getByText("Teclado", { exact: true })).toBeVisible();
  await expect(visibleList.getByText("Stock bajo", { exact: true })).toBeVisible();

  await page.getByRole("searchbox", { name: "Buscar inventario" }).fill("monitor");
  await expect(visibleList.getByText("Monitor", { exact: true })).toBeVisible();
  await expect(page.getByText("Teclado", { exact: true })).toHaveCount(0);

  await page.getByRole("searchbox", { name: "Buscar inventario" }).fill("MOU-002");
  await expect(visibleList.getByText("Mouse", { exact: true })).toBeVisible();
  await expect(page.getByText("Teclado", { exact: true })).toHaveCount(0);
  await page.getByRole("searchbox", { name: "Buscar inventario" }).clear();

  await page
    .getByRole("combobox", { name: "Filtrar inventario por categoría" })
    .selectOption("hardware");
  await expect(visibleList.getByText("Teclado", { exact: true })).toBeVisible();
  await expect(page.getByText("Mouse", { exact: true })).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Filtrar inventario por categoría" })
    .selectOption("all");

  await page.getByRole("checkbox", { name: "Solo stock bajo" }).check();
  await expect(visibleList.getByText("Teclado", { exact: true })).toBeVisible();
  await expect(visibleList.getByText("Mouse", { exact: true })).toBeVisible();
  await expect(page.getByText("Monitor", { exact: true })).toHaveCount(0);

  await page.getByRole("searchbox", { name: "Buscar inventario" }).fill("nada");
  await expect(
    page.getByRole("heading", { name: "No se encontraron resultados" }),
  ).toBeVisible();
});

test("uses cards on mobile and a table on desktop", async ({ page }, testInfo) => {
  await mockApi(page);
  await page.goto("/inventory");

  if (testInfo.project.name.startsWith("mobile")) {
    await expect(page.getByTestId("inventory-cards")).toBeVisible();
    await expect(page.getByTestId("inventory-table")).toBeHidden();
    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  } else {
    await expect(page.getByTestId("inventory-cards")).toBeHidden();
    await expect(page.getByTestId("inventory-table")).toBeVisible();
  }
});

test("keeps inventory cards readable at the sidebar breakpoint", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await mockApi(page);
  await page.goto("/inventory");

  await expect(page.getByTestId("inventory-cards")).toBeVisible();
  await expect(page.getByTestId("inventory-table")).toBeHidden();
  await expect(
    page.getByTestId("inventory-cards").getByText("Stock bajo", { exact: true }),
  ).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
