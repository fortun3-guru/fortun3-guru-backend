import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Logger,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NordicApiService } from './nordic-api.service';
import {
  GetWalletNFTsDto,
  GetAllContractNFTsDto,
  NFTResponseDto,
  SyncNFTMetadataResponseDto,
} from './dto/nordic-api.dto';
import {
  GetTokenBalanceDto,
  TokenBalanceResponseDto,
} from './dto/token-balance.dto';

@ApiTags('nordit-nft')
@Controller('nordit-nft')
export class NordicApiController {
  private readonly logger = new Logger(NordicApiController.name);

  constructor(private readonly nordicApiService: NordicApiService) { }

  @Get('wallet/:walletAddress')
  @ApiOperation({
    summary: 'Get all NFTs owned by a wallet address across multiple chains',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns NFT data grouped by blockchain network',
    type: NFTResponseDto,
  })
  async getNFTsByWalletAddress(
    @Param('walletAddress') walletAddress: string,
    @Query() queryParams: GetWalletNFTsDto,
  ): Promise<NFTResponseDto> {
    try {
      this.logger.log(`Fetching NFTs for wallet: ${walletAddress}`);

      // Convert string parameters to numbers
      const page = queryParams.page ? Number(queryParams.page) : 1;
      const limit = queryParams.limit ? Number(queryParams.limit) : 20;

      return await this.nordicApiService.getNFTsByWalletAddress(
        walletAddress,
        page,
        limit,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching NFTs for wallet ${walletAddress}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Error fetching NFTs: ${error.message}`);
    }
  }

  @Get('wallet/:chain/:walletAddress')
  @ApiOperation({
    summary: 'Get all NFTs owned by a wallet address on a specific chain',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns NFT data for the specified blockchain network',
    type: NFTResponseDto,
  })
  async getNFTsByWalletAddressForChain(
    @Param('chain') chain: string,
    @Param('walletAddress') walletAddress: string,
    @Query() queryParams: GetWalletNFTsDto,
  ): Promise<NFTResponseDto> {
    try {
      this.logger.log(
        `Fetching NFTs for wallet: ${walletAddress} on chain: ${chain}`,
      );

      // Convert string parameters to numbers
      const page = queryParams.page ? Number(queryParams.page) : 1;
      const limit = queryParams.limit ? Number(queryParams.limit) : 20;

      return await this.nordicApiService.getNFTsByWalletAddressForChain(
        chain,
        walletAddress,
        page,
        limit,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching NFTs for wallet ${walletAddress} on chain ${chain}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Error fetching NFTs: ${error.message}`);
    }
  }

  @Get('contracts')
  @ApiOperation({
    summary: 'Get all NFTs from supported contracts across multiple chains',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns NFT data from all supported contracts with pagination',
    type: NFTResponseDto,
  })
  async getAllNFTsFromContracts(
    @Query() queryParams: GetAllContractNFTsDto,
  ): Promise<NFTResponseDto> {
    try {
      this.logger.log('Fetching all NFTs from supported contracts');

      // Convert string parameters to numbers
      const page = queryParams.page ? Number(queryParams.page) : 1;
      const limit = queryParams.limit ? Number(queryParams.limit) : 20;

      return await this.nordicApiService.getAllNFTsFromContracts(page, limit);
    } catch (error) {
      this.logger.error(
        `Error fetching NFTs from contracts: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Error fetching NFTs: ${error.message}`);
    }
  }

  @Post('sync/:chain/:contractAddress/:tokenId')
  @ApiOperation({
    summary: 'Sync metadata for a specific NFT token',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the result of the metadata sync operation',
    type: SyncNFTMetadataResponseDto,
  })
  async syncNFTMetadata(
    @Param('chain') chain: string,
    @Param('contractAddress') contractAddress: string,
    @Param('tokenId') tokenId: string,
  ): Promise<SyncNFTMetadataResponseDto> {
    try {
      this.logger.log(
        `Syncing metadata for NFT: ${contractAddress}/${tokenId} on chain: ${chain}`,
      );

      return await this.nordicApiService.syncNFTMetadata(
        chain,
        contractAddress,
        tokenId,
      );
    } catch (error) {
      this.logger.error(
        `Error syncing NFT metadata for token ${contractAddress}/${tokenId} on chain ${chain}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error syncing NFT metadata: ${error.message}`,
      );
    }
  }

  @Post('tokens/:chain')
  @ApiOperation({
    summary: 'Get token balances for a wallet address on a specific chain',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns token balance data for the specified wallet and chain',
    type: TokenBalanceResponseDto,
  })
  async getTokenBalances(
    @Param('chain') chain: string,
    @Body() dto: GetTokenBalanceDto,
  ): Promise<TokenBalanceResponseDto> {
    try {
      this.logger.log(
        `Fetching token balances for wallet: ${dto.accountAddress} on chain: ${chain}`,
      );

      return await this.nordicApiService.getTokenBalances(
        chain,
        dto.accountAddress,
        dto.withCount || false,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching token balances for wallet ${dto.accountAddress} on chain ${chain}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error fetching token balances: ${error.message}`,
      );
    }
  }
}
