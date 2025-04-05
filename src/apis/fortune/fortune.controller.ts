import {
  Controller,
  Post,
  Body,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  FortuneService,
  CallFortuneParams,
  FortuneResponse,
} from './fortune.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

class CallFortuneDto implements CallFortuneParams {
  txHash: string;
  walletAddress: string;
  consult: string;
  lang: string;
  receiptId: string;
}

interface FortuneResponseData {
  success: boolean;
  data: FortuneResponse[];
}

@ApiTags('fortune')
@Controller('fortune')
export class FortuneController {
  private readonly logger = new Logger(FortuneController.name);

  constructor(private readonly fortuneService: FortuneService) { }

  @Post('tell')
  @ApiOperation({ summary: 'Get fortune telling based on blockchain data' })
  @ApiResponse({
    status: 200,
    description: 'Returns fortune telling results',
  })
  async tellFortune(@Body() dto: CallFortuneDto): Promise<FortuneResponseData> {
    try {
      this.logger.log(
        `Fortune telling requested for wallet: ${dto.walletAddress}, txHash: ${dto.txHash}`,
      );

      const fortuneResults = await this.fortuneService.callFortune({
        txHash: dto.txHash,
        walletAddress: dto.walletAddress,
        consult: dto.consult,
        lang: dto.lang,
        receiptId: dto.receiptId,
      });

      return {
        success: true,
        data: fortuneResults,
      };
    } catch (error) {
      this.logger.error(
        `Error in fortune telling: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Error processing fortune telling request');
    }
  }
}
