import { Permission } from "../models/Permission";
import { apiClient } from "./apiClient";
import { IPermissionService } from "./interfaces/IPermissionService";

export class PermissionService implements IPermissionService {
  async getAll(): Promise<Permission[] | null> {
    try {
      const data = await apiClient.get("/permissions");
      return Array.isArray(data) ? data.map((p: any) => new Permission(p)) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getById(id: number): Promise<Permission | null> {
    try {
      const data = await apiClient.get(`/permissions/${id}`);
      return new Permission(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getByRole(roleId: number): Promise<Permission[] | null> {
    try {
      const data = await apiClient.get(`/role-permissions/roles/${roleId}`);
      return Array.isArray(data)
        ? data
            .map((rolePermission: any) => rolePermission.permission)
            .filter((permission: any) => Boolean(permission))
            .map((permission: any) => new Permission(permission))
        : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async assignToRole(roleId: number, permissionIds: number[]): Promise<boolean | null> {
    try {
      for (const permissionId of permissionIds) {
        await apiClient.post("/role-permissions", { roleId, permissionId });
      }
      return true;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async removeFromRole(roleId: number, permissionId: number): Promise<boolean | null> {
    try {
      await apiClient.delete(`/role-permissions/${roleId}/${permissionId}`);
      return true;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
