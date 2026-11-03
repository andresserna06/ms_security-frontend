import { Session } from "../models/Session";
import { apiClient } from "./apiClient";
import {
  IRedirectOAuthProviderService,
  OAuthProviderType,
} from "./interfaces/IOAuthProviderService";

const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_SCOPE = "read:user user:email";

/**
 * Implementación concreta (DIP) del proveedor GitHub OAuth 2.0.
 * GitHub usa authorization code flow: el navegador se redirige a GitHub y el
 * backend canjea el code por un access token usando el client secret.
 */
export class GithubOAuthProviderService implements IRedirectOAuthProviderService {
  private readonly clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
  private readonly redirectUri =
    import.meta.env.VITE_GITHUB_REDIRECT_URI ||
    `${window.location.origin}/oauth/github-callback.html`;

  getProviderName(): OAuthProviderType {
    return "GITHUB";
  }

  extractEmailFromToken(): string {
    return "";
  }

  getAuthorizationUrl(state: string): string {
    if (!this.clientId) {
      throw new Error(
        "Falta configurar VITE_GITHUB_CLIENT_ID en el frontend para iniciar sesión con GitHub.",
      );
    }

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: GITHUB_SCOPE,
      prompt: "select_account",
      state,
    });

    return `${GITHUB_AUTHORIZE_URL}?${params.toString()}`;
  }

  async authenticate(code: string): Promise<Session> {
    const data = await apiClient.post("/auth/github", { code });
    return new Session(data);
  }
}
