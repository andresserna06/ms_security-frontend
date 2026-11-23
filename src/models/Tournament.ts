export class Tournament {
  id!: number;
  name!: string;
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
    }
  }
}
