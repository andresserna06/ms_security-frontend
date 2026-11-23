import {
  AssignPlayerSkillPayload,
  PlayerAssignedSkill,
  PlayerSkill,
  SkillAssignedPlayer,
} from "../../models/PlayerSkill";

export interface IPlayerSkillService {
  assignSkill(
    playerId: number,
    skillId: number,
    payload?: AssignPlayerSkillPayload,
  ): Promise<PlayerSkill>;
  removeSkill(playerId: number, skillId: number): Promise<void>;
  getByPlayer(playerId: number): Promise<PlayerAssignedSkill[]>;
  getPlayersBySkill(skillId: number): Promise<SkillAssignedPlayer[]>;
}
