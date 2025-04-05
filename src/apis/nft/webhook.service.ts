import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { NorditWebhookDto } from './dto/webhook.dto';
import { ContractEventListener } from '../blockchain/contract-event-listener';
import { MintingEventListener } from '../blockchain/minting-event-listener';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly contractEventListener: ContractEventListener,
    private readonly mintingEventListener: MintingEventListener,
  ) { }

  /**
   * Process a webhook from Nordit
   * @param chain The chain from the webhook URL
   * @param payload The webhook payload
   * @returns Processing result
   */
  async processNorditWebhook(
    chain: string,
    payload: NorditWebhookDto,
  ): Promise<{
    success: boolean;
    message: string;
    chain: string;
    processedAt: string;
  }> {
    try {
      this.logger.log(`Processing Nordit webhook for chain ${chain}`);
      this.logger.log(`Webhook payload: ${JSON.stringify(payload, null, 2)}`);

      // Store the webhook data in Firebase for future reference
      await this.storeWebhookData(chain, payload);

      // Log specific details based on event type
      if (payload.eventType === 'TOKEN_TRANSFER') {
        this.logger.log(
          `Token transfer event detected: ${payload.event.targetAddress} on chain ${payload.network}, protocol: ${payload.protocol}`,
        );

        // Process token transfer details from message
        if (payload.event.messages && payload.event.messages.length > 0) {
          const message = payload.event.messages[0];
          const blockNumber = message.block_number;

          // Query historic events using the blockNumber from the webhook
          await this.queryBlockchainEvents(blockNumber);

          this.logger.log(
            `Token transfer details: ${message.from_address} sent ${message.value} tokens to ${message.to_address}, txHash: ${message.transaction_hash}`,
          );
        }
      } else {
        this.logger.log(`Unknown event type: ${payload.eventType}`);
      }

      return {
        success: true,
        message: 'Webhook received and processed successfully',
        chain,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Error processing Nordit webhook: ${error.message}`,
        error.stack,
      );

      // Still try to store the raw data even if processing failed
      try {
        await this.storeWebhookData(chain, payload, error.message);
      } catch (storageError) {
        this.logger.error(
          `Failed to store webhook data: ${storageError.message}`,
        );
      }

      throw error;
    }
  }

  /**
   * Query historic events from blockchain listeners
   * @param blockNumber The block number to query from
   * @private
   */
  private async queryBlockchainEvents(blockNumber: number): Promise<void> {
    try {
      // Use a slightly lower block number to ensure we don't miss any events
      const fromBlock = Math.max(1, blockNumber - 10);

      this.logger.log(
        `Querying historic blockchain events from block ${fromBlock}`,
      );

      // Call queryHistoricEvents from both listeners
      await Promise.all([
        this.contractEventListener.queryHistoricEvents(fromBlock),
        this.mintingEventListener.queryHistoricEvents(fromBlock),
      ]);

      this.logger.log(
        'Historic blockchain events query completed successfully',
      );
    } catch (error) {
      this.logger.error(
        `Error querying historic blockchain events: ${error.message}`,
        error.stack,
      );
      // We don't want to rethrow this error as it shouldn't stop the webhook processing
    }
  }

  /**
   * Store webhook data in Firebase
   * @private
   */
  private async storeWebhookData(
    chain: string,
    payload: NorditWebhookDto,
    errorMessage?: string,
  ): Promise<void> {
    try {
      // Store in the webhooks collection
      await this.firebaseService.firestore.collection('webhooks').add({
        chain,
        payload,
        protocol: payload.protocol,
        network: payload.network,
        eventType: payload.eventType,
        processingError: errorMessage,
        createdAt: new Date(),
      });

      this.logger.log('Webhook data stored in Firebase');
    } catch (error) {
      this.logger.error(
        `Error storing webhook data: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
