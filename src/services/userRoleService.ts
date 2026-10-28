import { Role } from "../models/Role";
import { UserRole } from "../models/UserRole";
import { apiClient } from "./apiClient";
import { IUserRoleService } from "./interfaces/IUserRoleService";

export class UserRoleService implements IUserRoleService {
  async getAllRoles(): Promise<Role[] | null> {
    try {
      const data = await apiClient.get("/roles");
      return Array.isArray(data) ? data.map((role: any) => new Role(role)) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getByUser(userId: number): Promise<UserRole[] | null> {
    try {
      const data = await apiClient.get(`/user-roles/users/${userId}`);
      return Array.isArray(data)
        ? data.map(
            (userRole: any) =>
              new UserRole({
                ...userRole,
                role: userRole.role ? new Role(userRole.role) : undefined,
              }),
          )
        : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async assignRole(userId: number, roleId: number): Promise<UserRole | null> {
    try {
      const data = await apiClient.post("/user-roles", {
        userId: Number(userId),
        roleId: Number(roleId),
      });
      return new UserRole(data ?? { userId: Number(userId), roleId: Number(roleId) });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async removeRole(userId: number, roleId: number): Promise<boolean | null> {
    try {
      await apiClient.delete(`/user-roles/${userId}/${roleId}`);
      return true;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
