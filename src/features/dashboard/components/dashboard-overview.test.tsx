import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardOverview } from "./dashboard-overview";

describe("DashboardOverview", () => {
  it("presents the foundation status in Spanish", () => {
    render(<DashboardOverview />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Tu inventario, en un solo lugar",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByText("API centralizada")).toBeInTheDocument();
  });
});
