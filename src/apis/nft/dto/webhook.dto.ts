import { ApiProperty } from '@nestjs/swagger';

export class TokenTransferMessage {
  @ApiProperty({
    description: 'Type of token transfer',
    example: 'erc20',
  })
  type: string;

  @ApiProperty({
    description: 'Token contract address',
    example: '0x1629d7d8e39a0747677bfbf61c7643f112037b40',
  })
  token_address: string;

  @ApiProperty({
    description: 'Address sending the tokens',
    example: '0x635ff8246201f0ba7dc728672cdffb769dc1c933',
  })
  from_address: string;

  @ApiProperty({
    description: 'Address receiving the tokens',
    example: '0xde33a94559c5aeb2e2e8ec976bb6e09f05f7aa90',
  })
  to_address: string;

  @ApiProperty({
    description: 'Value of the transfer in smallest unit',
    example: '100000000000000',
  })
  value: string;

  @ApiProperty({
    description: 'Transaction hash',
    example: '0xf41dac85df6d9ac813217c269a19823ecdbe58f29fa4a731860c3f6d8b69bd3b',
  })
  transaction_hash: string;

  @ApiProperty({
    description: 'Log index in the transaction',
    example: 21,
  })
  log_index: number;

  @ApiProperty({
    description: 'Block number containing the transaction',
    example: 4683914,
  })
  block_number: number;

  @ApiProperty({
    description: 'Block timestamp',
    example: 1699856280,
  })
  block_timestamp: number;
}

export class EventData {
  @ApiProperty({
    description: 'Target address for the event',
    example: '0x1629d7d8e39a0747677bfbf61c7643f112037b40',
  })
  targetAddress: string;

  @ApiProperty({
    description: 'Array of message details',
    type: [TokenTransferMessage],
  })
  messages: TokenTransferMessage[];
}

export class NorditWebhookDto {
  @ApiProperty({
    description: 'Subscription ID for the webhook',
    example: '{YOUR_WEBHOOK_SUBSCRIPTION_ID}',
  })
  subscriptionId: string;

  @ApiProperty({
    description: 'Description of the webhook subscription',
    example: 'dummy',
  })
  description: string;

  @ApiProperty({
    description: 'Blockchain protocol',
    example: 'ETHEREUM',
    enum: [
      'ETHEREUM',
      'POLYGON',
      'ARBITRUM',
      'OPTIMISM',
      'BASE',
      'KAIA',
      'APTOS',
      'BITCOIN',
      'DOGECOIN',
      'AVALANCHE',
      'TRON',
      'RIPPLE',
    ],
  })
  protocol: string;

  @ApiProperty({
    description: 'Network name',
    example: 'SEPOLIA',
    enum: ['MAINNET', 'SEPOLIA', 'AMOY', 'HOLESKY', 'KAIROS', 'TESTNET'],
  })
  network: string;

  @ApiProperty({
    description: 'Type of subscription',
    example: 'WEBHOOK',
  })
  subscriptionType: string;

  @ApiProperty({
    description: 'Notification configuration',
    example: {
      webhookUrl: '{YOUR_WEBHOOK_URL}',
    },
  })
  notification: {
    webhookUrl: string;
  };

  @ApiProperty({
    description: 'Type of event being reported',
    example: 'TOKEN_TRANSFER',
  })
  eventType: string;

  @ApiProperty({
    description: 'Timestamp when the webhook was created',
    example: '2025-04-05T18:48:43.941Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Event details including messages and target address',
    type: EventData,
  })
  event: EventData;
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