import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppNavigation } from "./app-navigation";

describe("AppNavigation", () => {
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

  it("hides the extended message in compact navigation", () => {
    render(<AppNavigation compact />);

    expect(
      screen.queryByText("Base del panel preparada para los próximos módulos."),
    ).not.toBeInTheDocument();
  });
});
