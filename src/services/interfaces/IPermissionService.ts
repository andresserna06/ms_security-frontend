import { Permission } from "../../models/Permission";

export interface IPermissionService {
  getAll(): Promise<Permission[] | null>;
  getById(id: number): Promise<Permission | null>;
  create(permission: Permission): Promise<Permission | null>;
  update(id: number, permission: Permission): Promise<Permission | null>;
  remove(id: number): Promise<boolean | null>;
  getByRole(roleId: number): Promise<Permission[] | null>;
  assignToRole(roleId: number, permissionIds: number[]): Promise<boolean | null>;
  removeFromRole(roleId: number, permissionId: number): Promise<boolean | null>;
}