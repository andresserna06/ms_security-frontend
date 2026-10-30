export class Profile {
  id?: number;
  phone?: string;
  birthDate?: string;
  photo?: string;
  city?: string;
  bio?: string;
  userId?: number;

  constructor(data?: Partial<Profile>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
