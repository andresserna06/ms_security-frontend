import { User } from "../../models/User";

export interface IUserService {
  getAll(): Promise<User[] | null>;
  getById(id: number): Promise<User | null>;
  getDetailWithProfile(id: number): Promise<User | null>;
  getDetailWithRoles(id: number): Promise<User | null>;
  create(user: User): Promise<User | null>;
  update(id: number, user: User): Promise<User | null>;
  activate(id: number): Promise<User | null>;
  deactivate(id: number): Promise<User | null>;
  remove(id: number): Promise<boolean | null>;
}
