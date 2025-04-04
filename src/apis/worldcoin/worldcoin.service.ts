import { BadRequestException, Injectable } from '@nestjs/common';
import {
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
  MiniAppPaymentSuccessPayload,
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

  async confirmPayment(payload: MiniAppPaymentSuccessPayload, nonce: string) {
    if (payload.reference !== nonce) {
      throw new BadRequestException('Invalid nonce');
    }

    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?app_id=${process.env.WORLDCOIN_APP_ID}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.WORLDCOIN_DEV_PORTAL_API_KEY}`,
        },
      },
    );
    const transaction = await response.json();
    if (transaction.reference === nonce && transaction.status != 'failed') {
      return { success: true };
    } else {
      return { success: false };
    }
  }
}
