import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { Role, User } from './entities/user.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class UserService {
  constructor(private firebaseService: FirebaseService) {}

  async getOrCreateUserByWalletAddress(walletAddress: string) {
    const user = await this.getUserByWalletAddress(walletAddress);
    if (!user) {
      const user = new User();
      user.walletAddress = walletAddress;
      user.createdAt = new Date();
      user.updatedAt = new Date();
      user.role = Role.USER;
      user.nonce = this.generateNonce();

      const userRef = await this.firebaseService.firestore
        .collection('users')
        .add({ ...user });

      return User.fromFireStore({
        ...user,
        id: userRef.id,
      });
    }
    return user;
  }

  async getUserById(id: string) {
    const userRef = await this.firebaseService.firestore
      .collection('users')
      .doc(id)
      .get();

    if (!userRef.exists) {
      throw new UnauthorizedException('User not found');
    }

    const data = userRef.data();
    return User.fromFireStore({
      ...data,
      id: userRef.id,
    });
  }

  async getNonceByWalletAddress(walletAddress: string) {
    const user = await this.getUserByWalletAddress(walletAddress);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user.nonce;
  }

  async updateNonceByWalletAddress(walletAddress: string) {
    const userRef = await this.firebaseService.firestore
      .collection('users')
      .where('walletAddress', '==', walletAddress)
      .limit(1)
      .get();

    const data = userRef.docs[0].data();
    const user = User.fromFireStore({
      ...data,
      id: userRef.docs[0].id,
    });

    const nonce = this.generateNonce();
    await this.firebaseService.firestore
      .collection('users')
      .doc(user.id)
      .update({
        nonce,
      });

    return nonce;
  }

  async getUserByWalletAddress(walletAddress: string) {
    const userRef = await this.firebaseService.firestore
      .collection('users')
      .where('walletAddress', '==', walletAddress)
      .limit(1)
      .get();

    if (userRef.empty) {
      return null;
    }

    const data = userRef.docs[0].data();
    return User.fromFireStore({
      ...data,
      id: userRef.docs[0].id,
    });
  }

  private generateNonce(): string {
    return randomBytes(16).toString('hex');
  }
}
