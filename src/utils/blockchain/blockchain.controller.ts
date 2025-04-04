import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ContractEventListener } from './contract-event-listener';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

class QueryHistoricEventsDto {
  fromBlock: number;
  toBlock?: number | string;
}

@ApiTags('blockchain')
@Controller('blockchain')
export class BlockchainController {
  private readonly logger = new Logger(BlockchainController.name);

  constructor(private readonly contractEventListener: ContractEventListener) { }

  @Post('query-events')
  @ApiOperation({ summary: 'Query historic ConsultPaid events' })
  @ApiResponse({
    status: 200,
    description: 'Historic events query triggered successfully'
  })
  async queryHistoricEvents(@Body() dto: QueryHistoricEventsDto) {
    this.logger.log(`Querying historic events from block ${dto.fromBlock} to ${dto.toBlock || 'latest'}`);
    await this.contractEventListener.queryHistoricEvents(dto.fromBlock, dto.toBlock);
    return { success: true, message: 'Historic events query triggered successfully' };
  }
} 