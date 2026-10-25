import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MobileNavigation } from "./mobile-navigation";

describe("MobileNavigation", () => {
  it("opens with the keyboard and closes with Escape", async () => {
    const user = userEvent.setup();
    render(<MobileNavigation />);

    const trigger = screen.getByRole("button", { name: "Abrir menú" });
    trigger.focus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });
});
