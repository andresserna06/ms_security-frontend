import { getAuthHeaders } from "./apiClient";

/**
 * fetch que agrega automáticamente el header Authorization: Bearer <accessToken>.
 * Los headers que pases en `init` se combinan con el del token.
 */
export const authFetch = (url: string, init: RequestInit = {}) =>
  fetch(url, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init.headers as Record<string, string> | undefined),
    },
  });

export default authFetch;