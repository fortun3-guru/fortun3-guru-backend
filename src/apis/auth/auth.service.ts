import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ethers } from 'ethers';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  async getMessage(walletAddress: string) {
    const user =
      await this.userService.getOrCreateUserByWalletAddress(walletAddress);
    const message = `Sign this message to verify your wallet: ${user.nonce}`;
    return { message };
  }

  async verifySignature(walletAddress: string, signature: string) {
    const user = await this.userService.getUserByWalletAddress(walletAddress);
    if (!user.nonce) {
      throw new UnauthorizedException('Nonce not found');
    }

    const message = `Sign this message to verify your wallet: ${user.nonce}`;
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new UnauthorizedException('Invalid signature');
    }

    const accessToken = this.generateToken({ uid: user.id });
    await this.userService.updateNonceByWalletAddress(walletAddress);

    return { user, accessToken };
  }

  private generateToken(payload: { uid: string }) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES'),
    });
    return accessToken;
  }
}
