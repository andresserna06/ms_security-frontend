import { Permission } from "../models/Permission";
import { IPermissionService } from "./interfaces/IPermissionService";

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

  async assignToRole(roleId: number, permissionIds: number[]): Promise<boolean | null> {
    try {
      const responses = await Promise.all(
        permissionIds.map((permissionId) =>
          fetch(`${BASE_URL}/api/role-permissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roleId, permissionId }),
          }),
        ),
      );
      if (responses.some((response) => !response.ok)) throw new Error("Error assigning permissions");
      return true;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async removeFromRole(roleId: number, permissionId: number): Promise<boolean | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/role-permissions/${roleId}/${permissionId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error removing permission");
      return true;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}