import { Session } from "../models/Session";
import { apiClient } from "./apiClient";
import { IOAuthProviderService, OAuthProviderType } from "./interfaces/IOAuthProviderService";

/**
 * Implementación concreta (DIP) del proveedor Google OAuth 2.0 en el Frontend.
 * Se comunica con el endpoint POST /api/auth/google del Backend (OAuthProviderStrategy).
 */
export class GoogleOAuthProviderService implements IOAuthProviderService {
  private endpoint = "/auth/google";

  getProviderName(): OAuthProviderType {
    return "GOOGLE";
  }

  extractEmailFromToken(idToken: string): string {
    try {
      const parts = idToken.split(".");
      if (parts.length < 2) return "";
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(payload))?.email || "";
    } catch {
      return "";
    }
  }

  async authenticate(idToken: string): Promise<Session> {
    const data = await apiClient.post(this.endpoint, { idToken });
    return new Session(data);
  }
}
