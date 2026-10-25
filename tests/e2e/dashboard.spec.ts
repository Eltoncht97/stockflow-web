import { expect, test } from "@playwright/test";

test("shows the dashboard foundation", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Tu inventario, en un solo lugar",
    }),
  ).toBeVisible();
});

test("shows the persistent navigation on desktop", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop-only workflow");

  await page.goto("/");

  await expect(
    page.getByRole("navigation", { name: "Navegación principal" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir menú" })).toBeHidden();
});

test("uses the navigation drawer with the keyboard on mobile", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "Mobile-only workflow");

  await page.goto("/");
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
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
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
