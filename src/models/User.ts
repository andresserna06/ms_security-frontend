import { Profile } from "./Profile";
import { UserRole } from "./UserRole";

export class User {
  id!: number;
  name?: string;
  email?: string;
  password?: string;
  active?: boolean;
  profile?: Profile | null;
  roles?: UserRole[];

  constructor(data?: Partial<User>) {
    if (data) {
      Object.assign(this, data);
      if (data.profile) {
        this.profile = new Profile(data.profile);
      }
      if (Array.isArray(data.roles)) {
        this.roles = data.roles.map((r) => new UserRole(r));
      }
    }
  }
}
