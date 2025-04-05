import {
  Controller,
  Post,
  Param,
  Body,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { NorditWebhookDto, WebhookResponseDto } from './dto/webhook.dto';

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) { }

  @Post('nordit/:chain')
  @ApiOperation({
    summary: 'Receive webhook from Nordit for a specific chain',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook received and processed successfully',
    type: WebhookResponseDto,
  })
  async receiveNorditWebhook(
    @Param('chain') chain: string,
    @Body() payload: NorditWebhookDto,
  ): Promise<WebhookResponseDto> {
    try {
      this.logger.log(
        `Received Nordit webhook for chain: ${chain}, protocol: ${payload.protocol}, network: ${payload.network}`,
      );

      return await this.webhookService.processNorditWebhook(chain, payload);
    } catch (error) {
      this.logger.error(
        `Error processing webhook for chain ${chain}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error processing webhook: ${error.message}`,
      );
    }
  }
}
