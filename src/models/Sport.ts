export interface SportSummary {
  id: number;
  name: string;
}

export interface SportQueryFilters {
  active?: boolean;
  all?: boolean;
}

export class Sport {
  id!: number;
  name!: string;
  description?: string | null;
  active!: boolean;
  parentSportId?: number | null;
  parentSport?: SportSummary | null;
  subSportsCount?: number;

  constructor(data?: Partial<Sport>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
