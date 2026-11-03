export class Permission {
  id!: number;
  url!: string;
  method!: string;
  module!: string;
  model!: string;

  constructor(data?: Partial<Permission>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
