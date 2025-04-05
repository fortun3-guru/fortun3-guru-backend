import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ContractEventListener } from '../../apis/blockchain/contract-event-listener';
import { MintingEventListener } from '../../apis/blockchain/minting-event-listener';
import { FirebaseService } from '../../firebase/firebase.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firestore } from 'firebase-admin';

class QueryHistoricEventsDto {
  fromBlock: number;
  toBlock?: number | string;
}

class CheckMintingPaidDto {
  walletAddress?: string;
  blockNumber?: number;
  txHash?: string;
}

class CheckConsultPaidDto {
  walletAddress?: string;
  blockNumber?: number;
  txHash?: string;
}

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
  private readonly logger = new Logger(BlockchainController.name);

  constructor(
    private readonly contractEventListener: ContractEventListener,
    private readonly mintingEventListener: MintingEventListener,
    private readonly firebaseService: FirebaseService,
  ) { }

  @Post('query-consult-events')
  @ApiOperation({ summary: 'Query historic ConsultPaid events' })
  @ApiResponse({
    status: 200,
    description: 'Historic events query triggered successfully',
  })
  async queryConsultEvents(@Body() dto: QueryHistoricEventsDto) {
    this.logger.log(
      `Querying historic ConsultPaid events from block ${dto.fromBlock} to ${dto.toBlock || 'latest'}`,
    );
    await this.contractEventListener.queryHistoricEvents(
      dto.fromBlock,
      dto.toBlock,
    );
    return {
      success: true,
      message: 'Historic ConsultPaid events query triggered successfully',
    };
  }

  @Post('query-minting-events')
  @ApiOperation({ summary: 'Query historic MintingPaid events' })
  @ApiResponse({
    status: 200,
    description: 'Historic events query triggered successfully',
  })
  async queryMintingEvents(@Body() dto: QueryHistoricEventsDto) {
    this.logger.log(
      `Querying historic MintingPaid events from block ${dto.fromBlock} to ${dto.toBlock || 'latest'}`,
    );
    await this.mintingEventListener.queryHistoricEvents(
      dto.fromBlock,
      dto.toBlock,
    );
    return {
      success: true,
      message: 'Historic MintingPaid events query triggered successfully',
    };
  }

  @Get('check-minting')
  @ApiOperation({ summary: 'Check MintingPaid by blockNumber or txHash' })
  @ApiQuery({ name: 'walletAddress', required: false, type: String })
  @ApiQuery({ name: 'blockNumber', required: false, type: Number })
  @ApiQuery({ name: 'txHash', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Returns minting data if found',
  })
  @ApiResponse({
    status: 404,
    description: 'No minting found for given criteria',
  })
  async checkMinting(@Query() query: CheckMintingPaidDto) {
    this.logger.log(`Checking minting with params: ${JSON.stringify(query)}`);

    if (!query.blockNumber && !query.txHash && !query.walletAddress) {
      throw new BadRequestException(
        'At least one parameter (blockNumber, txHash or walletAddress) is required',
      );
    }

    try {
      let queryRef: firestore.Query =
        this.firebaseService.firestore.collection('nfts');

      if (query.blockNumber) {
        queryRef = queryRef.where('blockNumber', '==', query.blockNumber);
      }

      if (query.txHash) {
        queryRef = queryRef.where('txHash', '==', query.txHash);
      }

      if (query.walletAddress) {
        queryRef = queryRef.where('walletAddress', '==', query.walletAddress);
      }

      const snapshot = await queryRef.get();

      if (snapshot.empty) {
        throw new NotFoundException('No minting found for the given criteria');
      }

      const results = [];
      snapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || null,
        });
      });

      return {
        success: true,
        count: results.length,
        data: results,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error checking minting: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Error checking minting');
    }
  }

  @Get('check-consult')
  @ApiOperation({ summary: 'Check ConsultPaid by blockNumber or txHash' })
  @ApiQuery({ name: 'walletAddress', required: false, type: String })
  @ApiQuery({ name: 'blockNumber', required: false, type: Number })
  @ApiQuery({ name: 'txHash', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Returns consult data if found',
  })
  @ApiResponse({
    status: 404,
    description: 'No consult found for given criteria',
  })
  async checkConsult(@Query() query: CheckConsultPaidDto) {
    this.logger.log(`Checking consult with params: ${JSON.stringify(query)}`);

    if (!query.blockNumber && !query.txHash && !query.walletAddress) {
      throw new BadRequestException(
        'At least one parameter (blockNumber, txHash or walletAddress) is required',
      );
    }

    try {
      let queryRef: firestore.Query =
        this.firebaseService.firestore.collection('fortunes');

      if (query.blockNumber) {
        queryRef = queryRef.where('blockNumber', '==', query.blockNumber);
      }

      if (query.txHash) {
        queryRef = queryRef.where('txHash', '==', query.txHash);
      }

      if (query.walletAddress) {
        queryRef = queryRef.where('walletAddress', '==', query.walletAddress);
      }

      const snapshot = await queryRef.get();

      if (snapshot.empty) {
        throw new NotFoundException('No consult found for the given criteria');
      }

      const results = [];
      snapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || null,
        });
      });

      return {
        success: true,
        count: results.length,
        data: results,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error checking consult: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Error checking consult');
    }
  }
} 