import { Role } from "../models/Role";
import { IRoleService } from "./interfaces/IRoleService";

const BASE_URL = import.meta.env.VITE_URL_BACKEND;

export class RoleService implements IRoleService {
  private endpoint = "/api/roles";

  async getAll(): Promise<Role[] | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}`);
      if (!response.ok) throw new Error("Error fetching roles");
      const data = await response.json();
      return Array.isArray(data) ? data.map((r: any) => new Role(r)) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getById(id: number): Promise<Role | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}/${id}`);
      if (!response.ok) throw new Error("Error fetching role");
      const data = await response.json();
      return new Role(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async create(role: Role): Promise<Role | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(role),
      });
      if (!response.ok) throw new Error("Error creating role");
      const data = await response.json();
      return new Role(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async update(id: number, role: Role): Promise<Role | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(role),
      });
      if (!response.ok) throw new Error("Error updating role");
      const data = await response.json();
      return new Role(data);
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
      if (!response.ok) throw new Error("Error deleting role");
      return true;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
