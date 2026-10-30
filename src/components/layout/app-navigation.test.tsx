import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppNavigation } from "./app-navigation";

const { mockUsePathname } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}));

describe("AppNavigation", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  it("marks the dashboard link as the current page", () => {
    render(<AppNavigation />);

    expect(
      screen.getByRole("navigation", { name: "Navegación principal" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks the categories link as the current page", () => {
    mockUsePathname.mockReturnValue("/categories");

    render(<AppNavigation />);

    expect(screen.getByRole("link", { name: "Categorías" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks the products link as the current page", () => {
    mockUsePathname.mockReturnValue("/products");

    render(<AppNavigation />);

    expect(screen.getByRole("link", { name: "Productos" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks the inventory link as the current page", () => {
    mockUsePathname.mockReturnValue("/inventory");

    render(<AppNavigation />);

    expect(screen.getByRole("link", { name: "Inventario" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("hides the extended message in compact navigation", () => {
    render(<AppNavigation compact />);

    expect(
      screen.queryByText("Base del panel preparada para los próximos módulos."),
    ).not.toBeInTheDocument();
  });
});
