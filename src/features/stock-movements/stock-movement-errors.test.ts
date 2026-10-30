import { describe, expect, it } from "vitest";
import { ApiClientError } from "@/lib/api";
import { getStockMovementErrorMessage } from "./stock-movement-errors";

describe("getStockMovementErrorMessage", () => {
  it("explains an OUT conflict without exposing backend text", () => {
    expect(
      getStockMovementErrorMessage(
        new ApiClientError("Insufficient stock", 409),
        "create",
        "OUT",
      ),
    ).toBe(
      "No se pudo registrar la salida. El producto puede estar inactivo o no tener stock suficiente.",
    );
  });

  it("maps rate limits and history failures", () => {
    expect(
      getStockMovementErrorMessage(
        new ApiClientError("Technical", 429),
        "create",
        "IN",
      ),
    ).toContain("demasiadas solicitudes");
    expect(getStockMovementErrorMessage(new Error("Raw"), "history")).toBe(
      "No pudimos cargar el historial. Intentá nuevamente.",
    );
  });
});
