import { Session } from "../../models/Session";

export type OAuthProviderType = "GOOGLE" | "GITHUB" | "MICROSOFT";

/**
 * Abstracción (DIP) para proveedores de autenticación OAuth en el Frontend.
 * Espeja la arquitectura OAuthProviderStrategy del Backend para desacoplar
 * las Vistas y el AuthService del proveedor concreto (Google, etc.).
 */
export interface IOAuthProviderService {
  getProviderName(): OAuthProviderType;
  extractEmailFromToken(credential: string): string;
  authenticate(credential: string): Promise<Session>;
}

/**
 * Proveedor OAuth que inicia el flujo redirigiendo el navegador al proveedor
 * (authorization code flow). Google usa su propio botón, GitHub usa esta interfaz.
 */
export interface IRedirectOAuthProviderService extends IOAuthProviderService {
  getAuthorizationUrl(state: string): string;
}
