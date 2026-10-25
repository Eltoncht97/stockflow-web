const DEFAULT_ERROR_MESSAGE = "No se pudo completar la solicitud.";

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

function getApiBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configuredUrl) {
    throw new ApiClientError(
      "La configuración de la API no está disponible.",
      null,
    );
  }

  try {
    const url = new URL(configuredUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }

    return `${url.toString().replace(/\/$/, "")}/`;
  } catch {
    throw new ApiClientError(
      "La configuración de la API no es válida.",
      null,
    );
  }
}

function buildApiUrl(endpoint: string) {
  const normalizedEndpoint = endpoint.replace(/^\/+/, "");

  return new URL(normalizedEndpoint, getApiBaseUrl()).toString();
}

export async function apiRequest<TResponse>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(buildApiUrl(endpoint), {
      ...options,
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new ApiClientError(DEFAULT_ERROR_MESSAGE, null);
  }

  if (!response.ok) {
    throw new ApiClientError(DEFAULT_ERROR_MESSAGE, response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  try {
    return (await response.json()) as TResponse;
  } catch {
    throw new ApiClientError(DEFAULT_ERROR_MESSAGE, response.status);
  }
}
