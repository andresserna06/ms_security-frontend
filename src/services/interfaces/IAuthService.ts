import { Session } from "../../models/Session";
import { User } from "../../models/User";
import { OAuthProviderType } from "./IOAuthProviderService";

export interface AuthUserInfo {
  id: number;
  name: string;
  email: string;
  authProvider: string;
  avatar: string;
}

export interface IAuthService {
  register(user: User): Promise<User>;
  login(email: string, password: string): Promise<Session>;
  verify2Fa(email: string, code: string): Promise<Session>;
  loginGoogle(idToken: string, email?: string): Promise<Session>;
  loginAzure(idToken: string, email?: string): Promise<Session>;
  loginWithProvider(provider: OAuthProviderType, idToken: string, email?: string): Promise<Session>;
  forgotPassword(email: string): Promise<{ message: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ message: string }>;
  logout(): Promise<void>;
  setSession(session: Session, email?: string): void;
  getToken(): string | null;
  getUserEmail(): string;
  getUserName(): string;
  getUserId(): number | null;
  getUserAvatar(): string;
  getAuthProvider(): string;
  getCurrentUser(): AuthUserInfo | null;
  isAuthenticated(): boolean;
  clearSession(): void;
}
