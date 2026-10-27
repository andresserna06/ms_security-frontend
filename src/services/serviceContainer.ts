import { RoleService } from "./roleService";
import { PermissionService } from "./permissionService";

export const serviceContainer = {
  roleService: new RoleService(),
  permissionService: new PermissionService(),
};

export type ServiceContainer = typeof serviceContainer;
