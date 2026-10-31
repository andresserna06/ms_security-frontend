import { Session } from "../../models/Session";
import { User } from "../../models/User";
import { OAuthProviderType } from "./IOAuthProviderService";

export interface IAuthService {
  register(user: User): Promise<User>;
  login(email: string, password: string): Promise<Session>;
  verify2Fa(email: string, code: string): Promise<Session>;
  loginGoogle(idToken: string, email?: string): Promise<Session>;
  loginWithProvider(provider: OAuthProviderType, idToken: string, email?: string): Promise<Session>;
  logout(): Promise<void>;
  setSession(session: Session, email?: string): void;
  getToken(): string | null;
  getUserEmail(): string;
  isAuthenticated(): boolean;
  clearSession(): void;
}
