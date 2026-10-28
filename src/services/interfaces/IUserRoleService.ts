import { Role } from "../../models/Role";
import { UserRole } from "../../models/UserRole";

export interface IUserRoleService {
  getAllRoles(): Promise<Role[] | null>;
  getByUser(userId: number): Promise<UserRole[] | null>;
  assignRole(userId: number, roleId: number): Promise<UserRole | null>;
  removeRole(userId: number, roleId: number): Promise<boolean | null>;
}
