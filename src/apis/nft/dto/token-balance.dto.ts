import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class GetTokenBalanceDto {
  @ApiProperty({
    description: 'Wallet address to fetch token balances for',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsNotEmpty()
  @IsString()
  accountAddress: string;

  @ApiProperty({
    description: 'Whether to include token count in the response',
    example: false,
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  withCount?: boolean;
}

export class TokenInfo {
  @ApiProperty({
    description: 'Token contract address',
    example: '0xC5380e64127f79Df8c27384c22f2dbCb43f00551',
  })
  contractAddress: string;

  @ApiProperty({
    description: 'Token name',
    example: 'Test Token',
  })
  name: string;

  @ApiProperty({
    description: 'Token symbol',
    example: 'TST',
  })
  symbol: string;

  @ApiProperty({
    description: 'Token decimal places',
    example: 18,
  })
  decimals: number;

  @ApiProperty({
    description: 'Token balance in smallest unit',
    example: '1000000000000000000',
  })
  balance: string;

  @ApiProperty({
    description: 'Formatted token balance',
    example: '1.0',
  })
  formattedBalance: string;
}

export class TokenBalanceResponseDto {
  @ApiProperty({
    description: 'Success status of the operation',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Wallet address',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  accountAddress: string;

  @ApiProperty({
    description: 'Chain ID',
    example: 11155111,
  })
  chainId: number;

  @ApiProperty({
    description: 'Network name',
    example: 'Sepolia Testnet',
  })
  networkName: string;

  @ApiProperty({
    description: 'Total count of tokens (when withCount is true)',
    example: 2,
    required: false,
  })
  count?: number;

  @ApiProperty({
    description: 'List of tokens and their balances',
    type: [TokenInfo],
  })
  tokens: TokenInfo[];
} 