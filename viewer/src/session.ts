import { User } from './user';

export class Session {
  constructor(
    public readonly user: User,
  ) { }
}