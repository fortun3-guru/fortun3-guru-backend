import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';

export class GetWalletNFTsDto {
  @ApiProperty({
    description: 'Wallet address to fetch NFTs for',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsNotEmpty()
  @IsString()
  walletAddress: string;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit?: number;
}

export class GetAllContractNFTsDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    default: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  limit?: number;
}

export class ChainNFTDataDto {
  @ApiProperty({
    description: 'Chain ID of the blockchain',
    example: 11155111,
  })
  chainId: number;

  @ApiProperty({
    description: 'Name of the blockchain network',
    example: 'Sepolia Testnet',
  })
  networkName: string;

  @ApiProperty({
    description: 'Total number of NFTs found',
    example: 15,
  })
  totalCount: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'List of NFTs',
    type: 'array',
    example: [
      {
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
        tokenId: '123',
        metadata: {
          name: 'Fortune Teller #123',
          description: 'A mystical fortune telling NFT',
          image:
            'ipfs://bafybeihrz3qpqcvnrip5unrw5bnspzlwf7x47cr47q6ivrkpvl7r7vc3fi/123.png',
          attributes: [],
        },
      },
    ],
  })
  data: any[];
}

export class NFTResponseDto {
  @ApiProperty({
    description: 'Success status of the operation',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Wallet address being queried',
    example: '0x1234567890abcdef1234567890abcdef12345678',
    required: false,
  })
  walletAddress?: string;

  @ApiProperty({
    description: 'Chain ID (only for single chain responses)',
    example: 11155111,
    required: false,
  })
  chainId?: number;

  @ApiProperty({
    description: 'Network name (only for single chain responses)',
    example: 'Sepolia Testnet',
    required: false,
  })
  networkName?: string;

  @ApiProperty({
    description:
      'Total count of NFTs (for single chain or multi-chain queries)',
    example: 150,
    required: false,
  })
  totalCount?: number;

  @ApiProperty({
    description: 'Current page number (only for paginated responses)',
    example: 1,
    required: false,
  })
  page?: number;

  @ApiProperty({
    description: 'Number of items per page (only for paginated responses)',
    example: 20,
    required: false,
  })
  limit?: number;

  @ApiProperty({
    description: 'NFT data for single chain responses',
    type: 'array',
    example: [
      {
        contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
        tokenId: '123',
        metadata: {
          name: 'Fortune Teller #123',
          description: 'A mystical fortune telling NFT',
          image:
            'ipfs://bafybeihrz3qpqcvnrip5unrw5bnspzlwf7x47cr47q6ivrkpvl7r7vc3fi/123.png',
          attributes: [],
        },
      },
    ],
    required: false,
  })
  data?: any[];

  @ApiProperty({
    description:
      'Results grouped by blockchain network (only for multi-chain queries)',
    type: 'object',
    example: {
      sepolia: {
        chainId: 11155111,
        networkName: 'Sepolia Testnet',
        totalCount: 15,
        page: 1,
        limit: 20,
        data: [
          {
            contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
            tokenId: '123',
            metadata: {
              name: 'Fortune Teller #123',
              description: 'A mystical fortune telling NFT',
              image:
                'ipfs://bafybeihrz3qpqcvnrip5unrw5bnspzlwf7x47cr47q6ivrkpvl7r7vc3fi/123.png',
              attributes: [],
            },
          },
        ],
      },
    },
    required: false,
  })
  chains?: Record<string, ChainNFTDataDto>;
}

export class SyncNFTMetadataResponseDto {
  @ApiProperty({
    description: 'Success status of the operation',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Chain ID of the blockchain network',
    example: 11155111,
  })
  chainId: number;

  @ApiProperty({
    description: 'Name of the blockchain network',
    example: 'Sepolia Testnet',
  })
  networkName: string;

  @ApiProperty({
    description: 'NFT contract address',
    example: '0x02C844556100B8eE67CB0023bCCE462B229E9732',
  })
  contractAddress: string;

  @ApiProperty({
    description: 'Token ID of the NFT',
    example: '1',
  })
  tokenId: string;

  @ApiProperty({
    description: 'Result of the metadata sync operation',
    example: {
      status: 'success',
      message: 'Metadata sync initiated successfully',
      details: {
        contractAddress: '0x02C844556100B8eE67CB0023bCCE462B229E9732',
        tokenId: '1',
        status: 'queued',
      },
    },
  })
  syncResult: any;
}
