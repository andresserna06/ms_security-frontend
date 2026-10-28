import { RoleService } from "./roleService";
import { PermissionService } from "./permissionService";
import { UserRoleService } from "./userRoleService";

export const serviceContainer = {
  roleService: new RoleService(),
  permissionService: new PermissionService(),
  userRoleService: new UserRoleService(),
};

export type ServiceContainer = typeof serviceContainer;
