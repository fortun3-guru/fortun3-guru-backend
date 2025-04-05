import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { NorditWebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly firebaseService: FirebaseService) { }

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
      this.logger.log(
        `Processing Nordit webhook for chain ${chain}`,
      );
      this.logger.log(
        `Webhook payload: ${JSON.stringify(payload, null, 2)}`,
      );

      // Store the webhook data in Firebase for future reference
      await this.storeWebhookData(chain, payload);

      // Log specific details based on event type
      if (payload.eventType === 'token_transfer') {
        this.logger.log(
          `Token transfer event detected: ${payload.walletAddress} on chain ${chain}, txHash: ${payload.txHash}`,
        );
      } else if (payload.eventType === 'nft_transfer') {
        this.logger.log(
          `NFT transfer event detected: ${payload.contractAddress}/${payload.tokenId} to ${payload.walletAddress} on chain ${chain}, txHash: ${payload.txHash}`,
        );
      } else {
        this.logger.log(
          `Unknown event type: ${payload.eventType}`,
        );
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
      await this.firebaseService.firestore
        .collection('webhooks')
        .add({
          chain,
          ...payload,
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