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
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiProperty,
} from '@nestjs/swagger';

class CallFortuneDto implements CallFortuneParams {
  @ApiProperty({
    description: 'Transaction hash from blockchain',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  txHash: string;

  @ApiProperty({
    description: 'User wallet address',
    example: '0xabcdef1234567890abcdef1234567890abcdef12',
  })
  walletAddress: string;

  @ApiProperty({
    description: 'Type of fortune consultation',
    example: 'career',
  })
  consult: string;

  @ApiProperty({
    description: 'Language for the fortune result',
    example: 'en',
  })
  lang: string;

  @ApiProperty({
    description: 'Receipt ID for the fortune telling session',
    example: 'receipt-123456',
  })
  receiptId: string;
}

class FortuneResponseData {
  @ApiProperty({
    description: 'Indicates if the fortune telling operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Array of fortune telling results',
    type: 'array',
    items: {
      type: 'object',
    },
  })
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
    type: FortuneResponseData,
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
