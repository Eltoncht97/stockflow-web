import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTheme } from "next-themes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./theme-toggle";

vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}));

const mockedUseTheme = vi.mocked(useTheme);

describe("ThemeToggle", () => {
  const setTheme = vi.fn();

  beforeEach(() => {
    setTheme.mockReset();
  });

  it("switches from the light theme to the dark theme", async () => {
    mockedUseTheme.mockReturnValue({
      resolvedTheme: "light",
      setTheme,
      themes: ["light", "dark"],
    });
    const user = userEvent.setup();

    render(<ThemeToggle />);
    await user.click(
      screen.getByRole("button", { name: "Activar tema oscuro" }),
    );

    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("switches from the dark theme to the light theme", async () => {
    mockedUseTheme.mockReturnValue({
      resolvedTheme: "dark",
      setTheme,
      themes: ["light", "dark"],
    });
    const user = userEvent.setup();

    render(<ThemeToggle />);
    await user.click(
      screen.getByRole("button", { name: "Activar tema claro" }),
    );

    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
