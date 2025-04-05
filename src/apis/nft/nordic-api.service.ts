import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BlockchainNetworkConfig } from 'src/config/blockchain.config';

@Injectable()
export class NordicApiService {
  private readonly logger = new Logger(NordicApiService.name);
  private readonly nordicApiKey: string;
  private readonly nordicApiUrl: string;
  private readonly allChains: Record<string, BlockchainNetworkConfig>;
  private readonly supportedChains: Record<string, BlockchainNetworkConfig>;

  constructor(private readonly configService: ConfigService) {
    this.nordicApiKey = this.configService.get<string>('NORDIC_API_KEY');
    this.nordicApiUrl =
      this.configService.get<string>('NORDIC_API_URL') ||
      'https://api.nordicenergy.io';
    // get all chains with norditSuuport true
    this.allChains = this.configService.get('blockchain.networks');
    this.supportedChains = Object.fromEntries(
      Object.entries(this.allChains).filter(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([_, chain]) => chain.norditSupport,
      ),
    );

    // Validate that API key is set
    if (!this.nordicApiKey) {
      this.logger.warn(
        'NORDIC_API_KEY is not set. Nordic API requests will fail.',
      );
    }
  }

  /**
   * Get NFTs for a wallet address on a specific chain
   * @param chainKey The chain key to search on
   * @param walletAddress The wallet address to fetch NFTs for
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @returns Object containing NFT data for the specific chain
   */
  async getNFTsByWalletAddressForChain(
    chainKey: string,
    walletAddress: string,
    page = 1,
    limit = 20,
  ): Promise<any> {
    try {
      this.logger.log(
        `Fetching NFTs for wallet: ${walletAddress} on chain: ${chainKey}`,
      );

      // Check if the chain is supported
      if (!this.supportedChains[chainKey]) {
        const supportedChains = Object.keys(this.supportedChains).join(', ');
        throw new Error(
          `Chain ${chainKey} is not supported. Supported chains are: ${supportedChains}`,
        );
      }

      const chainConfig = this.supportedChains[chainKey];
      const result = await this.fetchNFTsByWalletForChain(
        walletAddress,
        chainConfig,
        chainKey,
        page,
        limit,
      );

      return {
        success: true,
        walletAddress,
        chainId: chainConfig.chainId,
        networkName: chainConfig.name,
        totalCount: result.totalCount,
        page,
        limit,
        data: result.data,
      };
    } catch (error) {
      this.logger.error(
        `Error in getNFTsByWalletAddressForChain: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all NFTs owned by a wallet address across multiple chains
   * @param walletAddress The wallet address to fetch NFTs for
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @returns Object containing NFT data grouped by chain
   */
  async getNFTsByWalletAddress(
    walletAddress: string,
    page = 1,
    limit = 20,
  ): Promise<any> {
    try {
      this.logger.log(`Fetching NFTs for wallet: ${walletAddress}`);

      const chainResults = {};
      const allPromises = [];

      // Fetch NFTs from each supported chain
      for (const [chainKey, chainConfig] of Object.entries(
        this.supportedChains,
      )) {
        allPromises.push(
          this.fetchNFTsByWalletForChain(
            walletAddress,
            chainConfig,
            chainKey,
            page,
            limit,
          )
            .then((result) => {
              chainResults[chainKey] = result;
            })
            .catch((err) => {
              this.logger.error(
                `Error fetching NFTs for chain ${chainKey}: ${err.message}`,
              );
              chainResults[chainKey] = { error: err.message, data: [] };
            }),
        );
      }

      // Wait for all API calls to complete
      await Promise.all(allPromises);

      return {
        success: true,
        walletAddress,
        chains: chainResults,
      };
    } catch (error) {
      this.logger.error(
        `Error in getNFTsByWalletAddress: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all NFTs from a specific contract across multiple chains
   * @param page Page number for pagination
   * @param limit Number of items per page
   * @returns Object containing NFT data from all supported contracts
   */
  async getAllNFTsFromContracts(page = 1, limit = 20): Promise<any> {
    try {
      this.logger.log(`Fetching all NFTs from supported contracts`);

      const chainResults = {};
      const allPromises = [];

      // Fetch NFTs from each supported chain's NFT contract
      for (const [chainKey, chainConfig] of Object.entries(
        this.supportedChains,
      )) {
        if (
          !chainConfig.nftContractAddress ||
          chainConfig.nftContractAddress ===
          '0x0000000000000000000000000000000000000000'
        ) {
          this.logger.warn(
            `Skipping chain ${chainKey}: No valid NFT contract address specified`,
          );
          continue;
        }

        allPromises.push(
          this.fetchNFTsFromContractForChain(
            chainConfig.nftContractAddress,
            chainConfig,
            chainKey,
            page,
            limit,
          )
            .then((result) => {
              chainResults[chainKey] = result;
            })
            .catch((err) => {
              this.logger.error(
                `Error fetching NFTs from contract for chain ${chainKey}: ${err.message}`,
              );
              chainResults[chainKey] = { error: err.message, data: [] };
            }),
        );
      }

      // Wait for all API calls to complete
      await Promise.all(allPromises);

      // Calculate total count across all chains
      const totalCount = Object.values(chainResults).reduce(
        (acc: number, curr: any) => {
          return acc + (curr.totalCount || 0);
        },
        0,
      );

      return {
        success: true,
        totalCount,
        page,
        limit,
        chains: chainResults,
      };
    } catch (error) {
      this.logger.error(
        `Error in getAllNFTsFromContracts: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Sync metadata for an NFT token
   * @param chainKey The chain key (e.g., 'sepolia', 'base_sepolia')
   * @param contractAddress The NFT contract address
   * @param tokenId The token ID to sync
   * @returns The result of the sync operation
   */
  async syncNFTMetadata(
    chainKey: string,
    contractAddress: string,
    tokenId: string,
  ): Promise<any> {
    try {
      this.logger.log(
        `Syncing metadata for NFT: ${contractAddress}/${tokenId} on chain: ${chainKey}`,
      );

      // Check if the chain is supported
      if (!this.supportedChains[chainKey]) {
        const supportedChains = Object.keys(this.supportedChains).join(', ');
        throw new Error(
          `Chain ${chainKey} is not supported. Supported chains are: ${supportedChains}`,
        );
      }

      const chainConfig = this.supportedChains[chainKey];
      const protocol = chainConfig.protocol;
      const network = chainConfig.network;

      // Construct the correct URL format as per Nodit API
      const apiUrl = `${this.nordicApiUrl}/v1/${protocol}/${network}/nft/syncNftMetadata`;

      this.logger.log(
        `Syncing NFT metadata with API URL: ${apiUrl}`,
      );

      const response = await axios.post(
        apiUrl,
        {
          tokens: [
            { contractAddress, tokenId },
          ],
        },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'X-API-KEY': this.nordicApiKey,
          },
        },
      );

      return {
        success: true,
        chainId: chainConfig.chainId,
        networkName: chainConfig.name,
        contractAddress,
        tokenId,
        syncResult: response.data,
      };
    } catch (error) {
      this.logger.error(
        `Error syncing NFT metadata for token ${contractAddress}/${tokenId} on chain ${chainKey}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Helper method to fetch NFTs owned by a wallet for a specific chain
   * @private
   */
  private async fetchNFTsByWalletForChain(
    walletAddress: string,
    chainConfig: BlockchainNetworkConfig,
    chainKey: string,
    page: number,
    limit: number,
  ): Promise<any> {
    try {
      const protocol = chainConfig.protocol;
      const network = chainConfig.network;
      // Construct the correct URL format as per Nodit API
      const apiUrl = `${this.nordicApiUrl}/v1/${protocol}/${network}/nft/getNftsOwnedByAccount`;

      this.logger.log(
        `Fetching NFTs for wallet ${walletAddress} on chain ${chainKey} with API URL: ${apiUrl}`,
      );

      const response = await axios.post(
        apiUrl,
        {
          accountAddress: walletAddress,
          withCount: false,
          withMetadata: true,
        },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'X-API-KEY': this.nordicApiKey,
          },
        },
      );

      console.log(response.data);
      return {
        chainId: chainConfig.chainId,
        networkName: chainConfig.name,
        totalCount: response.data.count || 0,
        page,
        limit,
        data: response.data.items || [],
      };
    } catch (error) {
      this.logger.error(
        `Error fetching NFTs for wallet ${walletAddress} on chain ${chainKey}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Helper method to fetch NFTs from a contract for a specific chain
   * @private
   */
  private async fetchNFTsFromContractForChain(
    contractAddress: string,
    chainConfig: BlockchainNetworkConfig,
    chainKey: string,
    page: number,
    limit: number,
  ): Promise<any> {
    try {
      const protocol = chainConfig.protocol;
      const network = chainConfig.network;
      // Construct the correct URL format as per Nodit API
      const apiUrl = `${this.nordicApiUrl}/v1/${protocol}/${network}/nft/getNftsByContract`;

      this.logger.log(
        `Fetching NFTs for contract ${contractAddress} on chain ${chainKey} with API URL: ${apiUrl}`,
      );

      const response = await axios.post(
        apiUrl,
        {
          contractAddress: contractAddress,
          withCount: true,
          withMetadata: true,
          limit: limit,
          offset: (page - 1) * limit,
        },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'X-API-KEY': this.nordicApiKey,
          },
        },
      );

      return {
        chainId: chainConfig.chainId,
        networkName: chainConfig.name,
        contractAddress,
        totalCount: response.data.count || 0,
        page,
        limit,
        data: response.data.nfts || [],
      };
    } catch (error) {
      this.logger.error(
        `Error fetching NFTs for contract ${contractAddress} on chain ${chainKey}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
