import { Role } from "./Role";
import { User } from "./User";

export class UserRole {
  id!: number;
  userId!: number;
  roleId?: number;
  role?: Role;
  user?: User;

  constructor(data?: Partial<UserRole>) {
    if (data) {
      Object.assign(this, data);

      if (data.role && !(data.role instanceof Role)) {
        this.role = new Role(data.role);
      }

      if (data.user && !(data.user instanceof User)) {
        this.user = new User(data.user);
      }
    }
  }
}