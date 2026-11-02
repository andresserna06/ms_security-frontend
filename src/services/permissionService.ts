
import { Permission } from "../models/Permission";
import { Role } from "../models/Role";
import { apiClient } from "./apiClient";
import {
  IPermissionService,
  RolePermissionSaveResult,
} from "./interfaces/IPermissionService";

export class PermissionService implements IPermissionService {
  async getAll(): Promise<Permission[] | null> {
    try {
      const data = await apiClient.get("/permissions");

      return Array.isArray(data)
        ? data.map((permission: any) => new Permission(permission))
        : null;
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

  async create(permission: Permission): Promise<Permission | null> {
    try {
      const data = await apiClient.post("/permissions", permission);
      return new Permission(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async update(
    id: number,
    permission: Permission,
  ): Promise<Permission | null> {
    try {
      const data = await apiClient.put(`/permissions/${id}`, permission);
      return new Permission(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async remove(id: number): Promise<boolean | null> {
    try {
      await apiClient.delete(`/permissions/${id}`);
      return true;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getByRole(roleId: number): Promise<Permission[] | null> {
    try {
      const data = await apiClient.get(
        `/role-permissions/roles/${roleId}`,
      );

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

  async getRolesByPermission(permissionId: number): Promise<Role[] | null> {
    try {
      const data = await apiClient.get(
        `/role-permissions/permissions/${permissionId}`,
      );

      return Array.isArray(data)
        ? data
            .map((permissionRole: any) => permissionRole.role)
            .filter((role: any) => Boolean(role))
            .map((role: any) => new Role(role))
        : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private async assignPermission(
    roleId: number,
    permissionId: number,
  ): Promise<number> {
    await apiClient.post("/role-permissions", {
      roleId,
      permissionId,
    });

    return permissionId;
  }

  private async removePermission(
    roleId: number,
    permissionId: number,
  ): Promise<number> {
    await apiClient.delete(
      `/role-permissions/${roleId}/${permissionId}`,
    );

    return permissionId;
  }

  async saveRolePermissions(
    roleId: number,
    addIds: number[],
    removeIds: number[],
  ): Promise<RolePermissionSaveResult | null> {
    try {
      const uniqueAddIds = Array.from(new Set(addIds)).filter(
        (id) => !removeIds.includes(id),
      );

      const uniqueRemoveIds = Array.from(new Set(removeIds)).filter(
        (id) => !addIds.includes(id),
      );

      const [addResults, removeResults] = await Promise.all([
        Promise.allSettled(
          uniqueAddIds.map((permissionId) =>
            this.assignPermission(roleId, permissionId),
          ),
        ),
        Promise.allSettled(
          uniqueRemoveIds.map((permissionId) =>
            this.removePermission(roleId, permissionId),
          ),
        ),
      ]);

      const result: RolePermissionSaveResult = {
        addedIds: [],
        removedIds: [],
        failedAddIds: [],
        failedRemoveIds: [],
      };

      addResults.forEach((response, index) => {
        if (response.status === "fulfilled") {
          result.addedIds.push(response.value);
        } else {
          result.failedAddIds.push(uniqueAddIds[index]);
        }
      });

      removeResults.forEach((response, index) => {
        if (response.status === "fulfilled") {
          result.removedIds.push(response.value);
        } else {
          result.failedRemoveIds.push(uniqueRemoveIds[index]);
        }
      });

      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
