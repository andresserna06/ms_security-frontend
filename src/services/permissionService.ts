import { Permission } from "../models/Permission";
import { Role } from "../models/Role";
import { IPermissionService } from "./interfaces/IPermissionService";
import type { RolePermissionSaveResult } from "./interfaces/IPermissionService";

const BASE_URL = import.meta.env.VITE_URL_BACKEND;

export class PermissionService implements IPermissionService {
  private endpoint = "/api/permissions";

  async getAll(): Promise<Permission[] | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}`);
      if (!response.ok) throw new Error("Error fetching permissions");
      const data = await response.json();
      return Array.isArray(data) ? data.map((p: any) => new Permission(p)) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getById(id: number): Promise<Permission | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}/${id}`);
      if (!response.ok) throw new Error("Error fetching permission");
      const data = await response.json();
      return new Permission(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async create(permission: Permission): Promise<Permission | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permission),
      });
      if (!response.ok) throw new Error("Error creating permission");
      const data = await response.json();
      return new Permission(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async update(id: number, permission: Permission): Promise<Permission | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permission),
      });
      if (!response.ok) throw new Error("Error updating permission");
      const data = await response.json();
      return new Permission(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async remove(id: number): Promise<boolean | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error deleting permission");
      return true;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getByRole(roleId: number): Promise<Permission[] | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/role-permissions/roles/${roleId}`);
      if (!response.ok) throw new Error("Error fetching permissions by role");
      const data = await response.json();
      return Array.isArray(data)
        ? data.map((rp: any) => new Permission(rp.permission ?? { id: rp.permissionId }))
        : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getRolesByPermission(permissionId: number): Promise<Role[] | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/role-permissions/permissions/${permissionId}`);
      if (!response.ok) throw new Error("Error fetching roles by permission");
      const data = await response.json();
      return Array.isArray(data)
        ? data.filter((rp: any) => rp.role).map((rp: any) => new Role(rp.role))
        : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private async assignPermission(roleId: number, permissionId: number): Promise<number> {
    const response = await fetch(`${BASE_URL}/api/role-permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId, permissionId }),
    });
    if (!response.ok) throw new Error("Error assigning permission");
    return permissionId;
  }

  private async removePermission(roleId: number, permissionId: number): Promise<number> {
    const response = await fetch(`${BASE_URL}/api/role-permissions/${roleId}/${permissionId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error removing permission");
    return permissionId;
  }

  /**
   * @deprecated Usar saveRolePermissions para conocer el resultado por permiso.
   */
  async assignToRole(roleId: number, permissionIds: number[]): Promise<boolean | null> {
    try {
      await Promise.all(
        permissionIds.map((permissionId) => this.assignPermission(roleId, permissionId)),
      );
      return true;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async removeFromRole(roleId: number, permissionId: number): Promise<boolean | null> {
    try {
      await this.removePermission(roleId, permissionId);
      return true;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async saveRolePermissions(
    roleId: number,
    addIds: number[],
    removeIds: number[],
  ): Promise<RolePermissionSaveResult | null> {
    try {
      const uniqueAddIds = Array.from(new Set(addIds)).filter((id) => !removeIds.includes(id));
      const uniqueRemoveIds = Array.from(new Set(removeIds)).filter((id) => !addIds.includes(id));

      const [addResults, removeResults] = await Promise.all([
        Promise.allSettled(
          uniqueAddIds.map((permissionId) => this.assignPermission(roleId, permissionId)),
        ),
        Promise.allSettled(
          uniqueRemoveIds.map((permissionId) => this.removePermission(roleId, permissionId)),
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
