import { Permission } from "../../models/Permission";

export interface IPermissionService {
  getAll(): Promise<Permission[] | null>;
  getById(id: number): Promise<Permission | null>;
  getByRole(roleId: number): Promise<Permission[] | null>;
  assignToRole(roleId: number, permissionIds: number[]): Promise<boolean | null>;
  removeFromRole(roleId: number, permissionId: number): Promise<boolean | null>;
}
