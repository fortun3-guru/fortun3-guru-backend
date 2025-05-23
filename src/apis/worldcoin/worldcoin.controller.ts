import { Controller, Get, Post, Body } from '@nestjs/common';
import { WorldcoinService } from './worldcoin.service';
import {
  MiniAppPaymentSuccessPayload,
  MiniAppWalletAuthSuccessPayload,
  ISuccessResult,
} from '@worldcoin/minikit-js/*';

@Controller('worldcoin')
export class WorldcoinController {
  constructor(private readonly worldcoinService: WorldcoinService) {}

  @Get('nonce')
  async getNonce() {
    return this.worldcoinService.nonce();
  }

  @Post('complete-siwe')
  async verify(
    @Body() body: { payload: MiniAppWalletAuthSuccessPayload; nonce: string },
  ) {
    return this.worldcoinService.verifySiweMessage(body.payload, body.nonce);
  }

  @Post('confirm-payment')
  async confirmPayment(
    @Body() body: { payload: MiniAppPaymentSuccessPayload; nonce: string },
  ) {
    return this.worldcoinService.confirmPayment(body.payload, body.nonce);
  }

  @Post('verify-user')
  async verifyUser(
    @Body() body: { payload: ISuccessResult; action: string; signal?: string },
  ) {
    return this.worldcoinService.verifyUser(
      body.payload,
      body.action,
      body.signal,
    );
  }
}
