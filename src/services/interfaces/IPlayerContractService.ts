import {
  CreatePlayerContractPayload,
  PlayerContract,
  PlayerTeamContract,
  TeamPlayerContract,
} from "../../models/PlayerContract";

export interface IPlayerContractService {
  create(
    teamId: number,
    payload: CreatePlayerContractPayload,
  ): Promise<PlayerContract>;
  endContract(contractId: number): Promise<PlayerContract>;
  getTeamPlayers(teamId: number, current?: boolean): Promise<TeamPlayerContract[]>;
  getPlayerTeams(playerId: number, current?: boolean): Promise<PlayerTeamContract[]>;
}
