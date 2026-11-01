import { RoleService } from "./roleService";
import { PermissionService } from "./permissionService";
import { UserRoleService } from "./userRoleService";
import { UserService } from "./userService";
import { ProfileService } from "./profileService";
import { GoogleOAuthProviderService } from "./googleOAuthProviderService";
import { GithubOAuthProviderService } from "./githubOAuthProviderService";
import { AuthService } from "./authService";

const googleOAuthProvider = new GoogleOAuthProviderService();
const githubOAuthProvider = new GithubOAuthProviderService();

export const serviceContainer = {
  googleOAuthProvider,
  githubOAuthProvider,
  authService: new AuthService([googleOAuthProvider, githubOAuthProvider]),
  roleService: new RoleService(),
  permissionService: new PermissionService(),
  userRoleService: new UserRoleService(),
  userService: new UserService(),
  profileService: new ProfileService(),
};

export type ServiceContainer = typeof serviceContainer;
