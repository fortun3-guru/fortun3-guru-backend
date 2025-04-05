import { ApiProperty } from '@nestjs/swagger';

export class NorditWebhookDto {
  @ApiProperty({
    description: 'Event type from Nordit webhook',
    example: 'token_transfer',
  })
  eventType: string;

  @ApiProperty({
    description: 'Chain ID or network identifier',
    example: 'sepolia',
  })
  chain: string;

  @ApiProperty({
    description: 'Block number where the event occurred',
    example: 3964723,
  })
  blockNumber: number;

  @ApiProperty({
    description: 'Transaction hash',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  txHash: string;

  @ApiProperty({
    description: 'Wallet address involved in the event',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  walletAddress: string;

  @ApiProperty({
    description: 'Contract address related to the event',
    example: '0xC5380e64127f79Df8c27384c22f2dbCb43f00551',
    required: false,
  })
  contractAddress?: string;

  @ApiProperty({
    description: 'Token ID for NFT-related events',
    example: '123',
    required: false,
  })
  tokenId?: string;

  @ApiProperty({
    description: 'Any additional data related to the event',
    type: 'object',
    required: false,
  })
  data?: Record<string, any>;

  @ApiProperty({
    description: 'Timestamp when the event occurred',
    example: '2023-04-05T08:30:00.000Z',
  })
  timestamp: string;
}

export class WebhookResponseDto {
  @ApiProperty({
    description: 'Success status of the webhook processing',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Message describing the result of the webhook processing',
    example: 'Webhook received and processed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Chain from the webhook URL',
    example: 'sepolia',
  })
  chain: string;

  @ApiProperty({
    description: 'Timestamp when the webhook was processed',
    example: '2023-04-05T08:30:00.000Z',
  })
  processedAt: string;
} 