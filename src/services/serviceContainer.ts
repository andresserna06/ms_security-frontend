import { RoleService } from "./roleService";
import { PermissionService } from "./permissionService";
import { UserRoleService } from "./userRoleService";
import { UserService } from "./userService";
import { ProfileService } from "./profileService";

export const serviceContainer = {
  roleService: new RoleService(),
  permissionService: new PermissionService(),
  userRoleService: new UserRoleService(),
  userService: new UserService(),
  profileService: new ProfileService(),
};

export type ServiceContainer = typeof serviceContainer;
