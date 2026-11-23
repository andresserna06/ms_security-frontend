import {
  AssignPlayerSkillPayload,
  PlayerAssignedSkill,
  PlayerSkill,
  SkillAssignedPlayer,
} from "../models/PlayerSkill";
import { IPlayerSkillService } from "./interfaces/IPlayerSkillService";
import { sportsRequest } from "./sportsHttp";

export class PlayerSkillService implements IPlayerSkillService {
  async assignSkill(
    playerId: number,
    skillId: number,
    payload?: AssignPlayerSkillPayload,
  ): Promise<PlayerSkill> {
    const body: AssignPlayerSkillPayload = {};
    if (
      payload?.level !== undefined &&
      !Number.isNaN(Number(payload.level))
    ) {
      body.level = Number(payload.level);
    }

    const data = await sportsRequest<PlayerSkill>(
      `/players/${playerId}/skills/${skillId}`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
    return new PlayerSkill(data);
  }

  async removeSkill(playerId: number, skillId: number): Promise<void> {
    await sportsRequest<void>(`/players/${playerId}/skills/${skillId}`, {
      method: "DELETE",
    });
  }

  async getByPlayer(playerId: number): Promise<PlayerAssignedSkill[]> {
    const data = await sportsRequest<PlayerAssignedSkill[]>(
      `/players/${playerId}/skills`,
    );
    return Array.isArray(data)
      ? data.map((item) => new PlayerAssignedSkill(item))
      : [];
  }

  async getPlayersBySkill(skillId: number): Promise<SkillAssignedPlayer[]> {
    const data = await sportsRequest<SkillAssignedPlayer[]>(
      `/skills/${skillId}/players`,
    );
    return Array.isArray(data)
      ? data.map((item) => new SkillAssignedPlayer(item))
      : [];
  }
}
