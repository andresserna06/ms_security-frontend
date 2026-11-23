import {
  GroupPhaseCreatePayload,
  GroupPhaseUpdatePayload,
  GroupTeam,
  Phase,
} from "../../models/Phase";

export interface IGroupService {
  getByTournament(tournamentId?: number): Promise<Phase[]>;
  getById(id: number): Promise<Phase>;
  create(payload: GroupPhaseCreatePayload): Promise<Phase>;
  update(id: number, payload: GroupPhaseUpdatePayload): Promise<Phase>;
  remove(id: number): Promise<void>;
  getTeams(groupId: number): Promise<GroupTeam[]>;
  assignTeam(groupId: number, teamId: number): Promise<void | Phase>;
  removeTeam(groupId: number, teamId: number): Promise<void>;
  getAssignableTeams(tournamentId: number, groupId: number): Promise<GroupTeam[]>;
}
