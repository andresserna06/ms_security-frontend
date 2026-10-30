import { User } from "../models/User";
import { IUserService } from "./interfaces/IUserService";

const BASE_URL = import.meta.env.VITE_URL_BACKEND;

export class UserService implements IUserService {
  private endpoint = "/api/users";

  async getAll(): Promise<User[] | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}`);
      if (!response.ok) throw new Error("Error fetching users");
      const data = await response.json();
      return Array.isArray(data) ? data.map((u: any) => new User(u)) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getById(id: number): Promise<User | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}/${id}`);
      if (!response.ok) throw new Error("Error fetching user");
      const data = await response.json();
      return new User(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getDetailWithProfile(id: number): Promise<User | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}/${id}/detail`);
      if (!response.ok) throw new Error("Error fetching user detail with profile");
      const data = await response.json();
      return new User(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getDetailWithRoles(id: number): Promise<User | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}/${id}/detail-with-roles`);
      if (!response.ok) throw new Error("Error fetching user detail with roles");
      const data = await response.json();
      return new User(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async create(user: User): Promise<User | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (!response.ok) throw new Error("Error creating user");
      const data = await response.json();
      return new User(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async update(id: number, user: User): Promise<User | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (!response.ok) throw new Error("Error updating user");
      const data = await response.json();
      return new User(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async activate(id: number): Promise<User | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}/${id}/activate`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Error activating user");
      const data = await response.json();
      return new User(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async deactivate(id: number): Promise<User | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.endpoint}/${id}/deactivate`, {
        method: "PATCH",
      });
      if (!response.ok) throw new Error("Error deactivating user");
      const data = await response.json();
      return new User(data);
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
      if (!response.ok) throw new Error("Error deleting user");
      return true;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
