import { expect, test, type Page } from "@playwright/test";

type ApiCategory = {
  id: string;
  name: string;
  description: null;
  createdAt: string;
  updatedAt: string;
};

const createCategory = (id: string, name: string): ApiCategory => ({
  id,
  name,
  description: null,
  createdAt: "2026-10-25T10:00:00.000Z",
  updatedAt: "2026-10-25T10:00:00.000Z",
});

async function mockCategoriesApi(
  page: Page,
  options: { rejectCreateWithConflict?: boolean } = {},
) {
  let categories = [
    createCategory("category-hardware", "Hardware"),
    createCategory("category-tools", "Tools"),
  ];

  await page.route("http://stockflow-api.test/categories**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const id = url.pathname.split("/").filter(Boolean)[1];

    if (request.method() === "GET") {
      await route.fulfill({ json: categories, status: 200 });
      return;
    }

    if (request.method() === "POST") {
      if (options.rejectCreateWithConflict) {
        await route.fulfill({
          json: {
            statusCode: 409,
            message: "A category with this name already exists",
          },
          status: 409,
        });
        return;
      }

      const body = request.postDataJSON() as { name: string };
      const category = createCategory(`category-${categories.length + 1}`, body.name);
      categories = [...categories, category];
      await route.fulfill({ json: category, status: 201 });
      return;
    }

    if (request.method() === "PATCH" && id) {
      const body = request.postDataJSON() as { name: string };
      const current = categories.find((category) => category.id === id);

      if (!current) {
        await route.fulfill({ json: { statusCode: 404 }, status: 404 });
        return;
      }

      const updated = { ...current, name: body.name };
      categories = categories.map((category) =>
        category.id === id ? updated : category,
      );
      await route.fulfill({ json: updated, status: 200 });
      return;
    }

    if (request.method() === "DELETE" && id) {
      categories = categories.filter((category) => category.id !== id);
      await route.fulfill({ status: 204 });
      return;
    }

    await route.fulfill({ json: { statusCode: 400 }, status: 400 });
  });
}

test("completes the main category workflow", async ({ page }, testInfo) => {
  await mockCategoriesApi(page);
  await page.goto("/categories");
  const visibleList = testInfo.project.name.startsWith("mobile")
    ? page.getByTestId("category-cards")
    : page.getByTestId("category-table");

  await expect(
    page.getByRole("heading", { level: 1, name: "Categorías" }),
  ).toBeVisible();
  await page.getByRole("searchbox", { name: "Buscar categorías" }).fill("tool");
  await expect(visibleList.getByText("Tools", { exact: true })).toBeVisible();
  await expect(page.getByText("Hardware", { exact: true })).toHaveCount(0);
  await page.getByRole("searchbox", { name: "Buscar categorías" }).clear();

  await page.getByRole("button", { name: "Nueva categoría" }).click();
  await page.getByRole("textbox", { name: "Nombre" }).fill("Oficina");
  await page.getByRole("button", { name: "Crear categoría" }).click();
  await expect(page.getByText("Categoría creada correctamente.")).toBeVisible();
  await expect(visibleList.getByText("Oficina", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Editar Oficina" }).click();
  await page.getByRole("textbox", { name: "Nombre" }).fill("Oficina central");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByText("Categoría actualizada correctamente.")).toBeVisible();
  await expect(
    visibleList.getByText("Oficina central", { exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Eliminar Oficina central" }).click();
  await page.getByRole("button", { name: "Eliminar categoría" }).click();
  await expect(page.getByText("Categoría eliminada correctamente.")).toBeVisible();
  await expect(
    visibleList.getByText("Oficina central", { exact: true }),
  ).toHaveCount(0);
});

test("shows duplicate-name conflicts in Spanish", async ({ page }) => {
  await mockCategoriesApi(page, { rejectCreateWithConflict: true });
  await page.goto("/categories");

  await page.getByRole("button", { name: "Nueva categoría" }).click();
  await page.getByRole("textbox", { name: "Nombre" }).fill("Hardware");
  await page.getByRole("button", { name: "Crear categoría" }).click();

  await expect(
    page.getByRole("alert").filter({
      hasText: "Ya existe una categoría con ese nombre.",
    }),
  ).toBeVisible();
});

test("uses cards on mobile and a table on desktop", async ({ page }, testInfo) => {
  await mockCategoriesApi(page);
  await page.goto("/categories");

  if (testInfo.project.name.startsWith("mobile")) {
    await expect(page.getByTestId("category-cards")).toBeVisible();
    await expect(page.getByTestId("category-table")).toBeHidden();
  } else {
    await expect(page.getByTestId("category-cards")).toBeHidden();
    await expect(page.getByTestId("category-table")).toBeVisible();
  }
});
