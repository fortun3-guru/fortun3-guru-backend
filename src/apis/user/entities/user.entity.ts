import { parseDate } from 'src/utils/parse-date';

export class User {
  id: string;
  walletAddress: string;
  nonce: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;

  static fromFireStore(data: any): User {
    const user = new User();
    user.id = data.id;
    user.nonce = data.nonce;
    user.role = data.role;
    user.walletAddress = data.walletAddress;

    if (data?.createdAt) {
      user.createdAt = parseDate(data.createdAt);
    }
    if (data?.updatedAt) {
      user.updatedAt = parseDate(data.updatedAt);
    }
    return user;
  }
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}
