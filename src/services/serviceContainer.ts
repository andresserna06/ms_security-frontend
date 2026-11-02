import { RoleService } from "./roleService";
import { PermissionService } from "./permissionService";
import { UserRoleService } from "./userRoleService";
import { UserService } from "./userService";
import { ProfileService } from "./profileService";
import { GoogleOAuthProviderService } from "./googleOAuthProviderService";
import { AzureOAuthProviderService } from "./azureOAuthProviderService";
import { AuthService } from "./authService";

const googleOAuthProvider = new GoogleOAuthProviderService();
const azureOAuthProvider = new AzureOAuthProviderService();

export const serviceContainer = {
  googleOAuthProvider,
  azureOAuthProvider,
  authService: new AuthService([googleOAuthProvider, azureOAuthProvider]),
  roleService: new RoleService(),
  permissionService: new PermissionService(),
  userRoleService: new UserRoleService(),
  userService: new UserService(),
  profileService: new ProfileService(),
};

export type ServiceContainer = typeof serviceContainer;
