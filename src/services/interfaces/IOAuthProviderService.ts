import { Session } from "../../models/Session";

export type OAuthProviderType = "GOOGLE" | "GITHUB" | "AZURE" | "MICROSOFT";

/**
 * Abstracción (DIP) para proveedores de autenticación OAuth en el Frontend.
 * Espeja la arquitectura OAuthProviderStrategy del Backend para desacoplar
 * las Vistas y el AuthService del proveedor concreto (Google, Azure, etc.).
 */
export interface IOAuthProviderService {
  getProviderName(): OAuthProviderType;
  extractEmailFromToken(idToken: string): string;
  authenticate(idToken: string): Promise<Session>;
  signIn?(): Promise<string>;
}
