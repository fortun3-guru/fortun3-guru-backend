import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ContractEventListener } from './contract-event-listener';
import { MintingEventListener } from './minting-event-listener';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

class QueryHistoricEventsDto {
  fromBlock: number;
  toBlock?: number | string;
}

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
  private readonly logger = new Logger(BlockchainController.name);

  constructor(
    private readonly contractEventListener: ContractEventListener,
    private readonly mintingEventListener: MintingEventListener,
  ) { }

  @Post('query-consult-events')
  @ApiOperation({ summary: 'Query historic ConsultPaid events' })
  @ApiResponse({
    status: 200,
    description: 'Historic events query triggered successfully'
  })
  async queryConsultEvents(@Body() dto: QueryHistoricEventsDto) {
    this.logger.log(
      `Querying historic ConsultPaid events from block ${dto.fromBlock} to ${dto.toBlock || 'latest'}`,
    );
    await this.contractEventListener.queryHistoricEvents(dto.fromBlock, dto.toBlock);
    return {
      success: true,
      message: 'Historic ConsultPaid events query triggered successfully'
    };
  }

  @Post('query-minting-events')
  @ApiOperation({ summary: 'Query historic MintingPaid events' })
  @ApiResponse({
    status: 200,
    description: 'Historic events query triggered successfully'
  })
  async queryMintingEvents(@Body() dto: QueryHistoricEventsDto) {
    this.logger.log(
      `Querying historic MintingPaid events from block ${dto.fromBlock} to ${dto.toBlock || 'latest'}`,
    );
    await this.mintingEventListener.queryHistoricEvents(dto.fromBlock, dto.toBlock);
    return {
      success: true,
      message: 'Historic MintingPaid events query triggered successfully'
    };
  }
} 