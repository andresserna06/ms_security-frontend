import { Role } from "../../models/Role";

export interface IRoleService {
  getAll(): Promise<Role[] | null>;
  getById(id: number): Promise<Role | null>;
  create(role: Role): Promise<Role | null>;
  update(id: number, role: Role): Promise<Role | null>;
  remove(id: number): Promise<boolean | null>;
}
