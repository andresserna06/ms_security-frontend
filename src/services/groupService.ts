import {
  GroupPhaseCreatePayload,
  GroupPhaseUpdatePayload,
  GroupTeam,
  Phase,
} from "../models/Phase";
import { IGroupService } from "./interfaces/IGroupService";
import { sportsRequest } from "./sportsHttp";
import { toGroupTeam, toPhase } from "./phaseService";
import { serviceContainer } from "./serviceContainer";

export class GroupService implements IGroupService {
  private readonly endpoint = "/groups";

  async getByTournament(tournamentId?: number): Promise<Phase[]> {
    const params = new URLSearchParams();
    if (tournamentId !== undefined) {
      params.set("tournamentId", String(tournamentId));
    }
    const query = params.toString();
    const path = query ? `${this.endpoint}?${query}` : this.endpoint;
    const data = await sportsRequest<any[]>(path);
    return Array.isArray(data)
      ? data.map((item) => ({ ...toPhase(item), phaseType: "GROUP" as const }))
      : [];
  }

  async getById(id: number): Promise<Phase> {
    const data = await sportsRequest<any>(`${this.endpoint}/${id}`);
    return { ...toPhase(data), phaseType: "GROUP" };
  }

  async create(payload: GroupPhaseCreatePayload): Promise<Phase> {
    const data = await sportsRequest<any>(this.endpoint, {
      method: "POST",
      body: JSON.stringify({
        name: payload.name.trim(),
        order: Number(payload.order),
        tournamentId: Number(payload.tournamentId),
      }),
    });
    return { ...toPhase(data), phaseType: "GROUP" };
  }

  async update(id: number, payload: GroupPhaseUpdatePayload): Promise<Phase> {
    const body: GroupPhaseUpdatePayload = {};
    if (payload.name !== undefined) body.name = payload.name.trim();
    if (payload.order !== undefined) body.order = Number(payload.order);
    const data = await sportsRequest<any>(`${this.endpoint}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return { ...toPhase(data), phaseType: "GROUP" };
  }

  async remove(id: number): Promise<void> {
    await sportsRequest<void>(`${this.endpoint}/${id}`, { method: "DELETE" });
  }

  async getTeams(groupId: number): Promise<GroupTeam[]> {
    const data = await sportsRequest<any[]>(`${this.endpoint}/${groupId}/teams`);
    return Array.isArray(data)
      ? data.map(toGroupTeam).filter((team): team is GroupTeam => team !== null)
      : [];
  }

  async assignTeam(groupId: number, teamId: number): Promise<void | Phase> {
    const data = await sportsRequest<any>(
      `${this.endpoint}/${groupId}/teams/${teamId}`,
      { method: "POST" },
    );
    if (data && typeof data === "object") {
      return { ...toPhase(data), phaseType: "GROUP" };
    }
    return undefined;
  }

  async removeTeam(groupId: number, teamId: number): Promise<void> {
    await sportsRequest<void>(`${this.endpoint}/${groupId}/teams/${teamId}`, {
      method: "DELETE",
    });
  }

  async getAssignableTeams(tournamentId: number, groupId: number): Promise<GroupTeam[]> {
    // Isolated function: uses current backend contracts.
    // If group assignment moves to registration, update only this method.
    const [confirmedTeams, groups, currentGroupTeams] = await Promise.all([
      serviceContainer.registrationService.getByTournament(tournamentId),
      this.getByTournament(tournamentId),
      this.getTeams(groupId),
    ]);

    const currentGroupTeamIds = new Set(currentGroupTeams.map((team) => team.id));
    const teamsInOtherGroups = new Set<number>();
    groups.forEach((group) => {
      if (group.id === groupId) return;
      (group.teams ?? []).forEach((team) => teamsInOtherGroups.add(team.id));
    });

    return confirmedTeams
      .filter((registration) => registration.status === "CONFIRMED")
      .map((registration) => ({
        id: registration.teamId,
        name: registration.teamName ?? `Equipo #${registration.teamId}`,
      }))
      .filter(
        (team) =>
          team.id > 0 &&
          (!teamsInOtherGroups.has(team.id) || currentGroupTeamIds.has(team.id)),
      );
  }
}
