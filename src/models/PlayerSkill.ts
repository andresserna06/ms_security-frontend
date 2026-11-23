import { Player } from "./Player";
import { Skill } from "./Skill";

export interface AssignPlayerSkillPayload {
  level?: number;
}

export class PlayerSkill {
  id!: number;
  playerId!: number;
  skillId!: number;
  level?: number | null;
  assignedAt!: string;

  constructor(data?: Partial<PlayerSkill>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class PlayerAssignedSkill {
  id!: number;
  skillId!: number;
  level?: number | null;
  assignedAt!: string;
  skill!: Skill;

  constructor(data?: Partial<PlayerAssignedSkill>) {
    if (data) {
      Object.assign(this, data);
      if (data.skill) {
        this.skill = new Skill(data.skill);
      }
    }
  }
}

export class SkillAssignedPlayer {
  id!: number;
  playerId!: number;
  level?: number | null;
  assignedAt!: string;
  player!: Player;

  constructor(data?: Partial<SkillAssignedPlayer>) {
    if (data) {
      Object.assign(this, data);
      if (data.player) {
        this.player = new Player(data.player);
      }
    }
  }
}
