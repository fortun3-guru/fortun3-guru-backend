import { Controller, Get, Post, Body } from '@nestjs/common';
import { WorldcoinService } from './worldcoin.service';
import { MiniAppWalletAuthSuccessPayload } from '@worldcoin/minikit-js/*';

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
}
