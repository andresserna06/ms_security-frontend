export class Profile {
  id?: number;
  phone?: string;
  birthDate?: string;

  constructor(data?: Partial<Profile>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
