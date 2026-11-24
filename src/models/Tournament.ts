export interface TournamentSport {
  id: number;
  name: string;
}

export interface TournamentPayload {
  name: string;
  sportId: number;
  startDate: string;
  enrollmentDeadline: string;
}

export interface TournamentQueryFilters {
  active?: boolean;
  sportId?: number;
  name?: string;
}

export class Tournament {
  id!: number;
  name!: string;
  sport?: TournamentSport;
  sportId?: number;
  sportName?: string;
  startDate?: string;
  endDate?: string;
  enrollmentDeadline?: string;
  active?: boolean;
  status?: string;

  constructor(data?: Partial<Tournament>) {
    if (data) {
      Object.assign(this, data);
      // ms_sports answers with `sport: { id, name }`; sportId and sportName are
      // filled from it so the views that read them keep working.
      if (this.sport) {
        this.sportId = this.sportId ?? this.sport.id;
        this.sportName = this.sportName ?? this.sport.name;
      }
    }
  }
}
