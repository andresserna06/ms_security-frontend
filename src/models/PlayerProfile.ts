import { Player } from "./Player";
import { PlayerTeamContract } from "./PlayerContract";
import { PlayerAssignedSkill } from "./PlayerSkill";

export class PlayerProfile {
  player!: Player;
  teams: PlayerTeamContract[] = [];
  teamsMessage: string | null = null;
  skills: PlayerAssignedSkill[] = [];
  skillsMessage: string | null = null;

  constructor(data?: Partial<PlayerProfile>) {
    if (data) {
      if (data.player) {
        this.player = new Player(data.player);
      }
      if (Array.isArray(data.teams)) {
        this.teams = data.teams.map((t) => new PlayerTeamContract(t));
      }
      this.teamsMessage = data.teamsMessage ?? null;
      if (Array.isArray(data.skills)) {
        this.skills = data.skills.map((s) => new PlayerAssignedSkill(s));
      }
      this.skillsMessage = data.skillsMessage ?? null;
    }
  }
}
