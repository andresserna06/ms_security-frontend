import { RoleService } from "./roleService";
import { PermissionService } from "./permissionService";
import { UserRoleService } from "./userRoleService";
import { UserService } from "./userService";
import { ProfileService } from "./profileService";
import { GoogleOAuthProviderService } from "./googleOAuthProviderService";
import { AuthService } from "./authService";

const googleOAuthProvider = new GoogleOAuthProviderService();

export const serviceContainer = {
  googleOAuthProvider,
  authService: new AuthService([googleOAuthProvider]),
  roleService: new RoleService(),
  permissionService: new PermissionService(),
  userRoleService: new UserRoleService(),
  userService: new UserService(),
  profileService: new ProfileService(),
};

export type ServiceContainer = typeof serviceContainer;
