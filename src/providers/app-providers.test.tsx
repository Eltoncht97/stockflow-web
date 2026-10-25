import { useQueryClient } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it } from "vitest";
import { AppProviders } from "./app-providers";

function QueryClientProbe() {
  const queryClient = useQueryClient();

  return (
    <span data-testid="query-stale-time">
      {String(queryClient.getDefaultOptions().queries?.staleTime)}
    </span>
  );
}

describe("AppProviders", () => {
  it("provides the query client and a themed Spanish notification region", async () => {
    localStorage.setItem("theme", "dark");

    render(
      <AppProviders>
        <QueryClientProbe />
      </AppProviders>,
    );

    expect(screen.getByTestId("query-stale-time")).toHaveTextContent("30000");
    const notificationRegion = screen.getByRole("region", {
      name: /notificaciones/i,
    });

    expect(notificationRegion).toBeInTheDocument();
    toast("Guardado", { duration: Number.POSITIVE_INFINITY });
    await waitFor(() => {
      expect(notificationRegion.querySelector("ol")).toHaveAttribute(
        "data-sonner-theme",
        "dark",
      );
    });

    expect(
      await screen.findByRole("button", { name: "Cerrar notificación" }),
    ).toBeInTheDocument();
  });
});
