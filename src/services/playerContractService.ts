import {
  CreatePlayerContractPayload,
  PlayerContract,
  PlayerTeamContract,
  TeamPlayerContract,
} from "../models/PlayerContract";
import { IPlayerContractService } from "./interfaces/IPlayerContractService";
import { sportsRequest } from "./sportsHttp";

export class PlayerContractService implements IPlayerContractService {
  async create(
    teamId: number,
    payload: CreatePlayerContractPayload,
  ): Promise<PlayerContract> {
    const body: CreatePlayerContractPayload = {
      playerId: Number(payload.playerId),
      startDate: payload.startDate.trim(),
    };

    if (payload.endDate && payload.endDate.trim().length > 0) {
      body.endDate = payload.endDate.trim();
    }

    const data = await sportsRequest<PlayerContract>(
      `/teams/${teamId}/contracts`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
    return new PlayerContract(data);
  }

  async endContract(contractId: number): Promise<PlayerContract> {
    const data = await sportsRequest<PlayerContract>(
      `/contracts/${contractId}/end`,
      {
        method: "PATCH",
      },
    );
    return new PlayerContract(data);
  }

  async getTeamPlayers(
    teamId: number,
    current?: boolean,
  ): Promise<TeamPlayerContract[]> {
    const params = new URLSearchParams();
    if (current !== undefined) {
      params.set("current", String(current));
    }
    const query = params.toString();
    const path = query
      ? `/teams/${teamId}/players?${query}`
      : `/teams/${teamId}/players`;
    const data = await sportsRequest<TeamPlayerContract[]>(path);
    return Array.isArray(data)
      ? data.map((c) => new TeamPlayerContract(c))
      : [];
  }

  async getPlayerTeams(
    playerId: number,
    current?: boolean,
  ): Promise<PlayerTeamContract[]> {
    const params = new URLSearchParams();
    if (current !== undefined) {
      params.set("current", String(current));
    }
    const query = params.toString();
    const path = query
      ? `/players/${playerId}/teams?${query}`
      : `/players/${playerId}/teams`;
    const data = await sportsRequest<PlayerTeamContract[]>(path);
    return Array.isArray(data)
      ? data.map((c) => new PlayerTeamContract(c))
      : [];
  }
}
