import { Skill } from "../../models/Skill";

export interface ISkillService {
  getAll(name?: string): Promise<Skill[]>;
}
