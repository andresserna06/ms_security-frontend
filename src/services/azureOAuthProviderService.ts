import { PublicClientApplication, Configuration } from "@azure/msal-browser";
import { Session } from "../models/Session";
import { apiClient } from "./apiClient";
import { IOAuthProviderService, OAuthProviderType } from "./interfaces/IOAuthProviderService";

const AZURE_CLIENT_ID =
  import.meta.env.VITE_AZURE_CLIENT_ID || "bf7d03c0-d403-4c17-9656-ecc130288f96";

const msalConfig: Configuration = {
  auth: {
    clientId: AZURE_CLIENT_ID,
    authority: "https://login.microsoftonline.com/common",
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    enableLegacyPolling: true,
  },
};

export class AzureOAuthProviderService implements IOAuthProviderService {
  private endpoint = "/auth/azure";
  private msalInstance: PublicClientApplication | null = null;
  private isInitialized = false;

  constructor() {
    this.getMsal().catch((err) => {
      console.warn("MSAL initialization:", err);
    });
  }

  private async getMsal(): Promise<PublicClientApplication> {
    if (!this.msalInstance) {
      this.msalInstance = new PublicClientApplication(msalConfig);
    }
    if (!this.isInitialized) {
      await this.msalInstance.initialize();
      this.isInitialized = true;
    }
    return this.msalInstance;
  }

  getProviderName(): OAuthProviderType {
    return "AZURE";
  }

  extractEmailFromToken(idToken: string): string {
    try {
      const parts = idToken.split(".");
      if (parts.length < 2) return "";
      const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(payload));
      return decoded.email || decoded.preferred_username || decoded.upn || "";
    } catch {
      return "";
    }
  }

  async signIn(): Promise<string> {
    const msal = await this.getMsal();
    const loginResponse = await msal.loginPopup({
      scopes: ["openid", "profile", "email"],
      prompt: "select_account",
    });
    return loginResponse.idToken;
  }

  async authenticate(idToken: string): Promise<Session> {
    const data = await apiClient.post(this.endpoint, { idToken });
    return new Session(data);
  }
}
