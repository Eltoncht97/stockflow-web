import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, apiRequest } from "./client";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("uses NEXT_PUBLIC_API_URL and returns typed JSON", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com/v1");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ready: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiRequest<{ ready: boolean }>("health");

    expect(result).toEqual({ ready: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/v1/health",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
  });

  it("serializes request bodies as JSON", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("settings", {
      body: { compact: true },
      method: "PATCH",
    });

    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(request.body).toBe('{"compact":true}');
    expect((request.headers as Headers).get("Content-Type")).toBe(
      "application/json",
    );
  });

  it("returns a safe error when configuration is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");

    await expect(apiRequest("health")).rejects.toEqual(
      expect.objectContaining<ApiClientError>({
        message: "La configuración de la API no está disponible.",
        name: "ApiClientError",
        status: null,
      }),
    );
  });

  it("does not expose backend error details", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Database unavailable" }), {
          status: 500,
        }),
      ),
    );

    await expect(apiRequest("health")).rejects.toEqual(
      expect.objectContaining<ApiClientError>({
        message: "No se pudo completar la solicitud.",
        name: "ApiClientError",
        status: 500,
      }),
    );
  });
});
