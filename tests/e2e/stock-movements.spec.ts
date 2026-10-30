import { expect, test, type Page } from "@playwright/test";

const activeProductId = "8f8c1c2f-7d87-4fd2-b5b3-76ea40c0bb83";
const inactiveProductId = "6e4eb2ef-af93-4210-b6b3-910246bca7ec";

const products = [
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

async function mockApi(page: Page) {
  const history = new Map<string, Array<Record<string, unknown>>>([
    [inactiveProductId, []],
    [activeProductId, []],
  ]);

  await page.route("http://stockflow-api.test/products", (route) =>
    route.fulfill({ json: products, status: 200 }),
  );
  await page.route(
    "http://stockflow-api.test/products/*/stock-movements",
    (route) => {
      const segments = new URL(route.request().url()).pathname.split("/");
      const productId = segments[2];
      return route.fulfill({
        json: history.get(productId) ?? [],
        status: 200,
      });
    },
  );
  await page.route("http://stockflow-api.test/stock-movements", async (route) => {
    const body = route.request().postDataJSON() as {
      productId: string;
      type: "IN" | "OUT";
      quantity: number;
      reason: string;
    };
    if (body.type === "OUT" && body.quantity > 5) {
      return route.fulfill({
        json: { message: "Insufficient stock" },
        status: 409,
      });
    }
    const movement = {
      id: "749be140-42fe-4ffd-a8b0-90d9bb859a3d",
      ...body,
      createdAt: "2026-10-29T12:00:00.000Z",
    };
    history.set(body.productId, [movement, ...(history.get(body.productId) ?? [])]);
    return route.fulfill({ json: movement, status: 201 });
  });
}

test("registers an OUT movement and opens its product history", async ({
  page,
}, testInfo) => {
  await mockApi(page);
  await page.goto("/stock-movements");

  await expect(
    page.getByRole("heading", { level: 1, name: "Movimientos de stock" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nuevo movimiento" }).click();
  const dialog = page.getByRole("dialog");
  const productSelect = dialog.getByRole("combobox", { name: "Producto" });

  await expect(productSelect.getByRole("option", { name: /Teclado/ })).toBeAttached();
  await expect(
    productSelect.getByRole("option", { name: /Producto anterior/ }),
  ).toHaveCount(0);
  await productSelect.selectOption(activeProductId);
  await expect(dialog.getByRole("status")).toContainText("Stock disponible: 5");
  await dialog.getByRole("radio", { name: "Salida" }).check();
  await dialog.getByRole("spinbutton", { name: "Cantidad" }).fill("6");
  await dialog.getByRole("textbox", { name: "Motivo" }).fill("Venta");
  await dialog.getByRole("button", { name: "Registrar salida" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "no tener stock suficiente",
  );

  await dialog.getByRole("spinbutton", { name: "Cantidad" }).fill("2");
  await dialog.getByRole("button", { name: "Registrar salida" }).click();

  await expect(page.getByText("Salida registrada correctamente.")).toBeVisible();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("combobox", { name: "Producto" })).toHaveValue(
    activeProductId,
  );
  const visibleHistory = testInfo.project.name.startsWith("mobile")
    ? page.getByTestId("stock-movement-cards")
    : page.getByTestId("stock-movement-table");
  await expect(visibleHistory.getByText("Venta", { exact: true })).toBeVisible();
  await expect(visibleHistory.getByText("Salida", { exact: true })).toBeVisible();

  const typeFilter = page.getByRole("combobox", { name: "Filtrar por tipo" });
  await typeFilter.selectOption("OUT");
  await expect(visibleHistory.getByText("Venta", { exact: true })).toBeVisible();
  await typeFilter.selectOption("IN");
  await expect(
    page.getByRole("heading", { name: "No hay movimientos para este filtro" }),
  ).toBeVisible();
  await typeFilter.selectOption("all");
  await expect(visibleHistory.getByText("Venta", { exact: true })).toBeVisible();
});

test("shows inactive product history but excludes it from creation", async ({
  page,
}) => {
  await mockApi(page);
  await page.goto("/stock-movements");

  const historyProduct = page.getByRole("combobox", { name: "Producto" });
  await expect(
    historyProduct.getByRole("option", { name: /Producto anterior.*Inactivo/ }),
  ).toBeAttached();
  await historyProduct.selectOption(inactiveProductId);
  await expect(
    page.getByRole("heading", { name: "Sin movimientos registrados" }),
  ).toBeVisible();
});

test("uses cards on narrow layouts and table on desktop", async ({
  page,
}, testInfo) => {
  await mockApi(page);
  await page.goto("/stock-movements");
  await page.getByRole("button", { name: "Nuevo movimiento" }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Producto" })
    .selectOption(activeProductId);
  await dialog.getByRole("spinbutton", { name: "Cantidad" }).fill("1");
  await dialog.getByRole("textbox", { name: "Motivo" }).fill("Reposición");
  await dialog.getByRole("button", { name: "Registrar entrada" }).click();

  if (testInfo.project.name.startsWith("mobile")) {
    await expect(page.getByTestId("stock-movement-cards")).toBeVisible();
    await expect(page.getByTestId("stock-movement-table")).toBeHidden();
  } else {
    await expect(page.getByTestId("stock-movement-cards")).toBeHidden();
    await expect(page.getByTestId("stock-movement-table")).toBeVisible();
  }

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

test("keeps movement cards readable at the sidebar breakpoint", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await mockApi(page);
  await page.goto("/stock-movements");
  await page.getByRole("button", { name: "Nuevo movimiento" }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("combobox", { name: "Producto" })
    .selectOption(activeProductId);
  await dialog.getByRole("spinbutton", { name: "Cantidad" }).fill("1");
  await dialog.getByRole("textbox", { name: "Motivo" }).fill("Reposición");
  await dialog.getByRole("button", { name: "Registrar entrada" }).click();

  await expect(page.getByTestId("stock-movement-cards")).toBeVisible();
  await expect(page.getByTestId("stock-movement-table")).toBeHidden();
  await expect(
    page.getByTestId("stock-movement-cards").getByText("Entrada", { exact: true }),
  ).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});
