import { BadRequestException, Injectable } from '@nestjs/common';
import {
  verifyCloudProof,
  MiniAppWalletAuthSuccessPayload,
  verifySiweMessage,
  MiniAppPaymentSuccessPayload,
  ISuccessResult,
  IVerifyResponse,
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

  async verifyUser(payload: ISuccessResult, action: string, signal?: string) {
    console.log(payload);
    const app_id = process.env.WORLDCOIN_APP_ID as `app_${string}`;
    console.log(app_id)
    const verifyRes = (await verifyCloudProof(
      payload,
      app_id,
      action,
      signal,
    )) as IVerifyResponse;
    console.log(verifyRes)
    if (verifyRes.success) {
      return { success: true, result: verifyRes };
    } else {
      return { success: false };
    }
  }
}
