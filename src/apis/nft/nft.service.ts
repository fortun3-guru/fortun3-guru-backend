import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { IPFSService } from './ipfs.service';
import { BlockchainConfigType } from '../../config/blockchain.config';

// ABI for ERC721 standard - minimal interface needed for minting
const ERC721_ABI = [
  'function mint(address to, uint256 tokenId) external',
  'function safeMint(address to, uint256 tokenId, string memory uri) external',
  'function tokenURI(uint256 tokenId) external view returns (string memory)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
];

// Supported chains configuration
export interface ChainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  contractAddress: string;
  explorerUrl: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

@Injectable()
export class NFTService {
  private readonly chainConfigs: Record<string, ChainConfig>;

  constructor(
    private configService: ConfigService,
    private ipfsService: IPFSService,
  ) {
    // Initialize supported chains from config
    const blockchainConfig =
      this.configService.get<BlockchainConfigType>('blockchain');
    this.chainConfigs = {};

    // Convert from blockchain config to chain config
    if (blockchainConfig && blockchainConfig.networks) {
      Object.entries(blockchainConfig.networks).forEach(
        ([networkId, network]) => {
          this.chainConfigs[networkId] = {
            name: network.name,
            chainId: network.chainId,
            rpcUrl: network.rpcUrl,
            contractAddress: network.contractAddress,
            explorerUrl: network.blockExplorer,
          };
        },
      );
    }
  }

  /**
   * สร้าง metadata สำหรับ NFT
   */
  async createNFTMetadata(metadata: NFTMetadata): Promise<string> {
    // อัพโหลด metadata ไปยัง IPFS โดยใช้ IPFSService
    return this.ipfsService.uploadMetadata(metadata);
  }

  /**
   * อัพโหลดรูปภาพและอัพเดท metadata
   */
  async uploadImageAndUpdateMetadata(
    imageBuffer: Buffer,
    metadata: NFTMetadata,
  ): Promise<NFTMetadata> {
    // อัพโหลดรูปภาพไปยัง IPFS
    const imageUri = await this.ipfsService.uploadImage(imageBuffer);

    // อัพเดท image URI ใน metadata
    return {
      ...metadata,
      image: imageUri,
    };
  }

  /**
   * Get provider for the specified chain
   */
  private getProvider(chainId: string): ethers.providers.JsonRpcProvider {
    const chainConfig = this.chainConfigs[chainId];
    if (!chainConfig) {
      throw new Error(`Chain ${chainId} not supported`);
    }

    return new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl);
  }

  /**
   * Get contract instance for the specified chain
   */
  private getContract(chainId: string, privateKey: string): ethers.Contract {
    const provider = this.getProvider(chainId);
    const chainConfig = this.chainConfigs[chainId];

    const wallet = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(chainConfig.contractAddress, ERC721_ABI, wallet);
  }

  /**
   * Mint NFT on the specified chain
   */
  async mintNFT(
    chainId: string,
    privateKey: string,
    receiverAddress: string,
    tokenId: number,
    metadata: NFTMetadata,
  ): Promise<{
    txHash: string;
    tokenId: number;
    contractAddress: string;
    explorerUrl: string;
    metadataUri: string;
  }> {
    if (!this.chainConfigs[chainId]) {
      throw new Error(`Chain ${chainId} not supported`);
    }

    // สร้าง metadata URI
    const metadataUri = await this.createNFTMetadata(metadata);

    // สร้าง contract instance
    const contract = this.getContract(chainId, privateKey);
    const chainConfig = this.chainConfigs[chainId];

    // เรียก safeMint function
    const tx = await contract.safeMint(receiverAddress, tokenId, metadataUri);
    const receipt = await tx.wait();

    return {
      txHash: receipt.transactionHash,
      tokenId,
      contractAddress: chainConfig.contractAddress,
      explorerUrl: `${chainConfig.explorerUrl}/tx/${receipt.transactionHash}`,
      metadataUri,
    };
  }

  /**
   * Get supported chains
   */
  getSupportedChains(): { id: string; name: string }[] {
    return Object.entries(this.chainConfigs).map(([id, config]) => ({
      id,
      name: config.name,
    }));
  }
}
