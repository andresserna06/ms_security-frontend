import { Role } from "./Role";
import { Permission } from "./Permission";

export class RolePermission {
  id!: number;
  role?: Role;
  permission?: Permission;
  roleId?: number;
  permissionId?: number;

  constructor(data?: Partial<RolePermission>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
