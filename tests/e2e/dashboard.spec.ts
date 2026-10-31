import { expect, test, type Page } from "@playwright/test";

const products = [
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

async function mockDashboardApi(page: Page) {
  await page.route("http://stockflow-api.test/products", (route) =>
    route.fulfill({ json: products, status: 200 }),
  );
  await page.route("http://stockflow-api.test/inventory/summary", (route) =>
    route.fulfill({
      json: {
        totalProducts: 1,
        totalUnits: 3,
        inStockProducts: 0,
        lowStockProducts: 1,
        outOfStockProducts: 2,
      },
      status: 200,
    }),
  );
}

test("shows the operational dashboard and follows useful navigation", async ({
  page,
}) => {
  await mockDashboardApi(page);
  await page.goto("/dashboard");

  await expect(
    page.getByRole("heading", { level: 1, name: "Panel principal" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Total de productos: 2/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Productos activos: 1/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Bajo stock: 3/ })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Valor del inventario:.*4\.500,75/ }),
  ).toBeVisible();

  await page.getByRole("link", { name: /Bajo stock: 3/ }).click();
  await expect(page).toHaveURL(/\/inventory$/);
});

test("uses responsive dashboard cards without horizontal scrolling", async ({
  page,
}, testInfo) => {
  await mockDashboardApi(page);
  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: /Total de productos: 2/ })).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);

  const productsCard = page.getByRole("link", { name: /Total de productos: 2/ });
  const activeCard = page.getByRole("link", { name: /Productos activos: 1/ });
  const productsBox = await productsCard.boundingBox();
  const activeBox = await activeCard.boundingBox();

  expect(productsBox).not.toBeNull();
  expect(activeBox).not.toBeNull();
  if (testInfo.project.name.startsWith("mobile")) {
    expect(activeBox?.y).toBeGreaterThan(productsBox?.y ?? 0);
  } else {
    expect(activeBox?.x).toBeGreaterThan(productsBox?.x ?? 0);
  }
});

test("shows the persistent navigation on desktop", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop-only workflow");
  await mockDashboardApi(page);
  await page.goto("/dashboard");

  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Inicio" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("button", { name: "Abrir menú" })).toBeHidden();
});

test("uses the navigation drawer with the keyboard on mobile", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile-only workflow");
  await mockDashboardApi(page);
  await page.goto("/dashboard");
  const menuButton = page.getByRole("button", { name: "Abrir menú" });

  await expect(menuButton).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeHidden();

  await menuButton.focus();
  await page.keyboard.press("Enter");

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("link", { name: "Inicio" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cerrar" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(menuButton).toBeFocused();
});

test("persists the selected color theme after reload", async ({ page }) => {
  await mockDashboardApi(page);
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Activar tema oscuro" }).click();

  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("dark");

  await page.reload();

  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(
    page.getByRole("button", { name: "Activar tema claro" }),
  ).toBeEnabled();
});
