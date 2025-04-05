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
    example:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
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

  @ApiProperty({
    description: 'Chain ID for the blockchain network',
    example: 'ethereum',
  })
  chainId: string;
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
      txHash:
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      raw: { additionalData: 'Raw data from fortune reading' },
      createdAt: '2023-06-01T00:00:00.000Z',
      updatedAt: '2023-06-01T00:00:00.000Z',
    },
  })
  data: ConsultResponse;
}

class MintNFTDto {
  @ApiProperty({
    description: 'ID of the consult document in Firebase',
    example: 'consult-123',
  })
  consultId: string;

  @ApiProperty({
    description: 'Receipt ID for the transaction',
    example: 'receipt-456',
  })
  receiptId: string;
}

class MintNFTResponseData {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Transaction hash of the minting transaction',
    example:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    required: false,
  })
  txHash?: string;

  @ApiProperty({
    description: 'Token ID of the minted NFT',
    example: 123456,
    required: false,
  })
  tokenId?: number;

  @ApiProperty({
    description: 'Contract address of the NFT',
    example: '0xabcdef1234567890abcdef1234567890abcdef12',
    required: false,
  })
  contractAddress?: string;

  @ApiProperty({
    description: 'URL to view the transaction on the block explorer',
    example:
      'https://explorer.example.com/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    required: false,
  })
  explorerUrl?: string;

  @ApiProperty({
    description: 'URI of the NFT metadata on IPFS',
    example: 'ipfs://bafybeih1234567890abcdef1234567890abcdef',
    required: false,
  })
  metadataUri?: string;

  @ApiProperty({
    description: 'Error message if the operation failed',
    example: 'Network name not specified in consult data',
    required: false,
  })
  error?: string;
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
        `Fortune telling requested for wallet: ${dto.walletAddress}, txHash: ${dto.txHash}, chainId: ${dto.chainId}`,
      );

      const fortuneResults = await this.fortuneService.callFortune({
        txHash: dto.txHash,
        walletAddress: dto.walletAddress,
        consult: dto.consult,
        lang: dto.lang,
        receiptId: dto.receiptId,
        chainId: dto.chainId,
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

  @Post('mint-nft')
  @ApiOperation({ summary: 'Mint an NFT from a consult' })
  @ApiResponse({
    status: 200,
    description: 'Returns the result of the NFT minting operation',
    type: MintNFTResponseData,
  })
  @ApiResponse({
    status: 400,
    description: 'Error minting the NFT',
  })
  @ApiResponse({
    status: 404,
    description: 'Consult not found',
  })
  async mintNFT(@Body() dto: MintNFTDto): Promise<MintNFTResponseData> {
    try {
      this.logger.log(
        `Minting NFT for consult: ${dto.consultId}, receipt: ${dto.receiptId}`,
      );

      const result = await this.fortuneService.mintNFTFromConsult(
        dto.consultId,
        dto.receiptId,
      );

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Error minting NFT: ${error.message}`, error.stack);
      throw new BadRequestException(`Error minting NFT: ${error.message}`);
    }
  }
}
