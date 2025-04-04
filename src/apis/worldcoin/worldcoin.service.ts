import { Injectable } from '@nestjs/common';
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
} from '@worldcoin/minikit-js';

@Injectable()
export class WorldcoinService {
  async verifySiweMessage(
    payload: MiniAppWalletAuthSuccessPayload,
    nonce: string,
  ) {
    const validMessage = await verifySiweMessage(payload, nonce);
    return validMessage;
  }

  async nonce() {
    return crypto.randomUUID().replace(/-/g, '');
  }
}
