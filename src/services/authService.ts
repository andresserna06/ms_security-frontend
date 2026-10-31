import { Session } from "../models/Session";
import { User } from "../models/User";
import { apiClient } from "./apiClient";
import { GoogleOAuthProviderService } from "./googleOAuthProviderService";
import { IAuthService } from "./interfaces/IAuthService";
import { IOAuthProviderService, OAuthProviderType } from "./interfaces/IOAuthProviderService";

export class AuthService implements IAuthService {
  private strategies: Map<OAuthProviderType, IOAuthProviderService>;

  constructor(providerStrategies: IOAuthProviderService[] = [new GoogleOAuthProviderService()]) {
    this.strategies = new Map();
    providerStrategies.forEach((strategy) => {
      this.strategies.set(strategy.getProviderName(), strategy);
    });
  }

  /**
   * HU-SE-07: Registro tradicional de usuario mediante el modelo User
   */
  async register(user: User): Promise<User> {
    const data = await apiClient.post("/auth/register", {
      name: (user.name ?? "").trim(),
      email: (user.email ?? "").trim(),
      password: user.password ?? "",
    });
    return new User(data);
  }

  /**
   * Paso 1: Enviar credenciales e iniciar el desafío 2FA
   */
  async login(email: string, password: string): Promise<Session> {
    const data = await apiClient.post("/auth/login", {
      email: email.trim(),
      password,
    });
    return new Session(data);
  }

  /**
   * Paso 2: Verificar el código 2FA de 6 dígitos recibido por correo
   */
  async verify2Fa(email: string, code: string): Promise<Session> {
    const data = await apiClient.post("/auth/verify-2fa", {
      email: email.trim(),
      code: code.trim(),
    });
    const session = new Session({ ...data, email: email.trim() });

    if (session.accessToken) {
      this.setSession(session, email.trim());
    }

    return session;
  }

  /**
   * Inicio de sesión con proveedor externo mediante la abstracción IOAuthProviderService (DIP)
   */
  async loginWithProvider(
    provider: OAuthProviderType,
    idToken: string,
    email = "",
  ): Promise<Session> {
    const strategy = this.strategies.get(provider);
    if (!strategy) {
      throw new Error(`Proveedor de autenticación no soportado: ${provider}`);
    }

    const resolvedEmail = email || strategy.extractEmailFromToken(idToken);
    const session = await strategy.authenticate(idToken);
    session.email = resolvedEmail;

    if (session.accessToken) {
      this.setSession(session, resolvedEmail);
    }

    return session;
  }

  /**
   * Inicio de sesión con Google OAuth 2.0 delegando en la estrategia IOAuthProviderService (DIP)
   */
  async loginGoogle(idToken: string, email = ""): Promise<Session> {
    return this.loginWithProvider("GOOGLE", idToken, email);
  }

  /**
   * Cierre de sesión en el backend y limpieza de almacenamiento local
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.warn("Error al invalidar sesión en el servidor:", error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Guarda los datos del modelo Session en localStorage
   */
  setSession(session: Session, email = ""): void {
    if (session.accessToken) {
      localStorage.setItem("accessToken", session.accessToken);
    }
    localStorage.removeItem("token");
    localStorage.setItem("tokenType", session.tokenType || "Bearer");
    localStorage.setItem("tokenExpiresAt", session.expiresAt || "");
    const userEmail = email || session.email || "";
    if (userEmail) {
      localStorage.setItem("userEmail", userEmail);
    }
  }

  /**
   * Obtiene el token JWT actual
   */
  getToken(): string | null {
    return localStorage.getItem("accessToken");
  }

  /**
   * Obtiene el correo del usuario autenticado
   */
  getUserEmail(): string {
    return localStorage.getItem("userEmail") || "";
  }

  /**
   * Verifica si existe un token JWT estructuralmente válido y no expirado en almacenamiento
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token || typeof token !== "string") {
      return false;
    }

    const parts = token.split(".");
    if (parts.length !== 3 || parts.some((part) => !part || !part.trim())) {
      this.clearSession();
      return false;
    }

    const expiresAt = localStorage.getItem("tokenExpiresAt");
    if (expiresAt) {
      const expirationTime = Date.parse(expiresAt);
      if (!Number.isNaN(expirationTime) && Date.now() >= expirationTime) {
        this.clearSession();
        return false;
      }
    }

    try {
      const headerBase64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
      const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const header = JSON.parse(atob(headerBase64));
      const payload = JSON.parse(atob(payloadBase64));

      if (!header?.alg || !payload?.exp || Date.now() >= payload.exp * 1000) {
        this.clearSession();
        return false;
      }
    } catch {
      this.clearSession();
      return false;
    }

    return true;
  }

  /**
   * Limpia todo rastro de la sesión local
   */
  clearSession(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("tokenType");
    localStorage.removeItem("tokenExpiresAt");
    localStorage.removeItem("userEmail");
  }
}

export const authService = new AuthService();

export default authService;
