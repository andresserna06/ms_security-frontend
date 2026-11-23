import { authFetch } from "./authFetch";

export const SPORTS_BASE_URL = (
  import.meta.env.VITE_URL_SPORTS || "http://localhost:3001"
).replace(/\/+$/, "");

export class SportsApiError extends Error {
  status: number;
  errorCase: string | null;

  constructor(message: string, status: number, errorCase: string | null = null) {
    super(message);
    this.name = "SportsApiError";
    this.status = status;
    this.errorCase = errorCase;
  }
}

export async function sportsRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  if (init.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await authFetch(`${SPORTS_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new SportsApiError(
      "No se pudo conectar con el servicio deportivo (ms_sports). Verifica que esté activo en " +
        SPORTS_BASE_URL +
        ".",
      0,
      "NETWORK_ERROR",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let message = "Error al procesar la solicitud en el servicio deportivo.";
    let errorCase: string | null = null;

    if (data && typeof data === "object") {
      errorCase = typeof data.errorCase === "string" ? data.errorCase : null;
      if (Array.isArray(data.message)) {
        message = data.message.join(". ");
      } else if (typeof data.message === "string" && data.message.trim()) {
        message = data.message;
      }
    } else if (typeof data === "string" && data.trim()) {
      message = data;
    }

    throw new SportsApiError(message, response.status, errorCase);
  }

  return data as T;
}
