import { Profile } from "../../models/Profile";

export interface IProfileService {
  getByUserId(userId: number): Promise<Profile | null>;
  create(userId: number, profile: Profile): Promise<Profile | null>;
  update(userId: number, profile: Profile): Promise<Profile | null>;
  remove(userId: number): Promise<boolean | null>;
}
