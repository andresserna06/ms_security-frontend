export type PhaseType = "GROUP" | "FINAL";

export type FinalRound =
  | "ROUND_OF_16"
  | "QUARTERFINAL"
  | "SEMIFINAL"
  | "THIRD_PLACE"
  | "FINAL";

export const FINAL_ROUND_OPTIONS: { value: FinalRound; label: string }[] = [
  { value: "ROUND_OF_16", label: "Octavos" },
  { value: "QUARTERFINAL", label: "Cuartos" },
  { value: "SEMIFINAL", label: "Semifinal" },
  { value: "THIRD_PLACE", label: "Tercer puesto" },
  { value: "FINAL", label: "Final" },
];

export function getFinalRoundLabel(finalRound?: FinalRound | string | null): string {
  const option = FINAL_ROUND_OPTIONS.find((item) => item.value === finalRound);
  return option?.label ?? "";
}

export interface GroupTeam {
  id: number;
  name: string;
  groupId?: number | null;
}

export interface Phase {
  id: number;
  name: string;
  order: number;
  tournamentId: number | null;
  phaseType: PhaseType;
  finalRound?: FinalRound | null;
  teams?: GroupTeam[];
}

export interface PhaseCreatePayload {
  name: string;
  order: number;
  tournamentId: number;
}

export interface GroupPhaseCreatePayload extends PhaseCreatePayload {}

export interface GroupPhaseUpdatePayload {
  name?: string;
  order?: number;
}

export interface FinalPhaseCreatePayload extends PhaseCreatePayload {
  finalRound: FinalRound;
}

export interface FinalPhaseUpdatePayload {
  name?: string;
  order?: number;
  finalRound?: FinalRound;
}
