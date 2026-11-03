
import { Permission } from "../../models/Permission";
import { Role } from "../../models/Role";

export interface RolePermissionSaveResult {
  addedIds: number[];
  removedIds: number[];
  failedAddIds: number[];
  failedRemoveIds: number[];
  forbidden: boolean;
  message: string | null;
}

export interface IPermissionService {
  getAll(): Promise<Permission[] | null>;
  getById(id: number): Promise<Permission | null>;
  create(permission: Permission): Promise<Permission | null>;
  update(id: number, permission: Permission): Promise<Permission | null>;
  remove(id: number): Promise<boolean | null>;

  getByRole(roleId: number): Promise<Permission[] | null>;
  getRolesByPermission(permissionId: number): Promise<Role[] | null>;

  saveRolePermissions(
    roleId: number,
    addIds: number[],
    removeIds: number[],
  ): Promise<RolePermissionSaveResult | null>;
}
