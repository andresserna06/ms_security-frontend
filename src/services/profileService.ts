import { Profile } from "../models/Profile";
import { IProfileService } from "./interfaces/IProfileService";

const BASE_URL = import.meta.env.VITE_URL_BACKEND;

export class ProfileService implements IProfileService {
  private getEndpoint(userId: number): string {
    return `/api/users/${userId}/profile`;
  }

  async getByUserId(userId: number): Promise<Profile | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.getEndpoint(userId)}`);
      if (!response.ok) throw new Error("Error fetching profile");
      const data = await response.json();
      return data ? new Profile(data) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async create(userId: number, profile: Profile): Promise<Profile | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.getEndpoint(userId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!response.ok) throw new Error("Error creating profile");
      const data = await response.json();
      return new Profile(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async update(userId: number, profile: Profile): Promise<Profile | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.getEndpoint(userId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!response.ok) throw new Error("Error updating profile");
      const data = await response.json();
      return new Profile(data);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async remove(userId: number): Promise<boolean | null> {
    try {
      const response = await fetch(`${BASE_URL}${this.getEndpoint(userId)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error deleting profile");
      return true;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
