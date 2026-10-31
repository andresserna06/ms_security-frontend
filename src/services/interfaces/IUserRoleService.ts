import { Role } from "../../models/Role";
import { User } from "../../models/User";
import { UserRole } from "../../models/UserRole";

export interface IUserRoleService {
  getAllRoles(): Promise<Role[] | null>;
  getAllUsers(): Promise<User[] | null>;
  getByUser(userId: number): Promise<UserRole[] | null>;
  getByRole(roleId: number): Promise<UserRole[] | null>;
  assignRole(userId: number, roleId: number): Promise<UserRole | null>;
  removeRole(userId: number, roleId: number): Promise<boolean | null>;
}
