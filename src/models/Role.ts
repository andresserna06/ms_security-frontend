export class Role {
  id!: number;
  name!: string;
  description!: string;

  constructor(data?: Partial<Role>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
