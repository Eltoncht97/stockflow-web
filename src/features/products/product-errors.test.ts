import { describe, expect, it } from "vitest";
import { ApiClientError } from "@/lib/api";
import { getProductErrorMessage, type ProductOperation } from "./product-errors";

describe("getProductErrorMessage", () => {
  it.each([
    [400, "Revisá los datos ingresados e intentá nuevamente."],
    [409, "Ya existe un producto con ese SKU."],
    [429, "Se realizaron demasiadas solicitudes. Esperá un momento e intentá nuevamente."],
    [500, "El servidor no pudo completar la operación. Intentá nuevamente más tarde."],
  ])("maps status %s to a safe Spanish message", (status, message) => {
    expect(
      getProductErrorMessage(new ApiClientError("Technical error", status), "create"),
    ).toBe(message);
  });

  it.each([
    ["create", "La categoría seleccionada ya no existe. Actualizá la página e intentá nuevamente."],
    ["update", "El producto o la categoría seleccionada ya no existe. Actualizá la página e intentá nuevamente."],
    ["status", "El producto ya no existe. Actualizá la lista e intentá nuevamente."],
    ["load", "El producto ya no existe. Actualizá la lista e intentá nuevamente."],
  ] satisfies [ProductOperation, string][])(
    "maps 404 for the %s operation",
    (operation, message) => {
      expect(
        getProductErrorMessage(new ApiClientError("Technical error", 404), operation),
      ).toBe(message);
    },
  );

  it("uses operation-specific fallback messages", () => {
    expect(getProductErrorMessage(new Error("offline"), "load")).toBe(
      "No pudimos cargar los productos. Intentá nuevamente.",
    );
    expect(getProductErrorMessage(new Error("offline"), "update")).toBe(
      "No pudimos completar la operación. Intentá nuevamente.",
    );
  });
});
