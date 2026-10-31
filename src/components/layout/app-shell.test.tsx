import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("AppShell", () => {
  it("provides a Spanish keyboard skip link to the main content", async () => {
    const user = userEvent.setup();
    render(
      <AppShell>
        <h1>Contenido</h1>
      </AppShell>,
    );

    const skipLink = screen.getByRole("link", { name: "Saltar al contenido" });
    expect(skipLink).toHaveAttribute("href", "#main-content");
    expect(skipLink).toHaveClass("sr-only", "focus:not-sr-only");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");

    await user.tab();
    expect(skipLink).toHaveFocus();
  });
});
