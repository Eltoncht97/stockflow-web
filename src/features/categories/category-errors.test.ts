import { describe, expect, it } from "vitest";
import { ApiClientError } from "@/lib/api";
import { getCategoryErrorMessage } from "./category-errors";

describe("getCategoryErrorMessage", () => {
  it.each([
    [400, "Revisá los datos ingresados"],
    [404, "La categoría ya no existe"],
    [429, "demasiadas solicitudes"],
    [500, "El servidor no pudo completar"],
  ])("maps status %s to a friendly message", (status, expected) => {
    expect(
      getCategoryErrorMessage(
        new ApiClientError("Technical error", status),
        "update",
      ),
    ).toContain(expected);
  });

  it("uses an operation-specific conflict message", () => {
    const error = new ApiClientError("Technical error", 409);

    expect(getCategoryErrorMessage(error, "create")).toBe(
      "Ya existe una categoría con ese nombre.",
    );
    expect(getCategoryErrorMessage(error, "delete")).toBe(
      "No se puede eliminar la categoría porque tiene productos asociados.",
    );
  });
});
