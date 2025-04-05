import {
  Controller,
  Post,
  Body,
  Logger,
  BadRequestException,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {
  FortuneService,
  CallFortuneParams,
  FortuneResponse,
  ConsultResponse,
} from './fortune.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiProperty,
  ApiParam,
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

class ConsultResponseData {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Consult data',
    type: 'object',
    example: {
      id: 'consult-123',
      consult: 'career',
      filename: 'career_reading_01',
      lang: 'th',
      short: 'คุณจะได้รับโอกาสทางอาชีพที่ดีในไม่ช้า',
      long: 'ในอนาคตอันใกล้นี้ คุณจะได้พบกับโอกาสทางอาชีพที่น่าสนใจ อาจเป็นการเลื่อนตำแหน่ง หรือข้อเสนองานใหม่ที่ดีกว่าเดิม...',
      sound: 'https://storage.example.com/sounds/career_reading_01.mp3',
      tarot: 'The Star',
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      raw: { additionalData: 'Raw data from fortune reading' },
      createdAt: '2023-06-01T00:00:00.000Z',
      updatedAt: '2023-06-01T00:00:00.000Z',
    }
  })
  data: ConsultResponse;
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

  @Get('consult/:id')
  @ApiOperation({ summary: 'Get consult information by ID from Firebase' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the consult to retrieve',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns consult information',
    type: ConsultResponseData,
  })
  @ApiResponse({
    status: 404,
    description: 'Consult not found',
  })
  async getConsultById(@Param('id') id: string): Promise<ConsultResponseData> {
    try {
      this.logger.log(`Fetching consult with ID: ${id}`);

      const consultData = await this.fortuneService.getConsultById(id);

      return {
        success: true,
        data: consultData,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Error fetching consult: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Error fetching consult with ID: ${id}`);
    }
  }
}
