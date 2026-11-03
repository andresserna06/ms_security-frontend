import { RoleService } from "./roleService";
import { PermissionService } from "./permissionService";
import { UserRoleService } from "./userRoleService";
import { UserService } from "./userService";
import { ProfileService } from "./profileService";
import { GoogleOAuthProviderService } from "./googleOAuthProviderService";
import { AzureOAuthProviderService } from "./azureOAuthProviderService";
import { GithubOAuthProviderService } from "./githubOAuthProviderService";
import { AuthService } from "./authService";

const googleOAuthProvider = new GoogleOAuthProviderService();
const azureOAuthProvider = new AzureOAuthProviderService();
const githubOAuthProvider = new GithubOAuthProviderService();

export const serviceContainer = {
  googleOAuthProvider,
  azureOAuthProvider,
  githubOAuthProvider,
  authService: new AuthService([
    googleOAuthProvider,
    azureOAuthProvider,
    githubOAuthProvider,
  ]),
  roleService: new RoleService(),
  permissionService: new PermissionService(),
  userRoleService: new UserRoleService(),
  userService: new UserService(),
  profileService: new ProfileService(),
};

export type ServiceContainer = typeof serviceContainer;
