import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { IPFSService } from './ipfs.service';
import { BlockchainConfigType } from '../../config/blockchain.config';

// ABI for ERC721 standard - minimal interface needed for minting
const ERC721_ABI = [
  'function mint(address to) external returns (uint256)',
  'function safeMint(address to, string memory uri) external returns (uint256)',
  'function tokenURI(uint256 tokenId) external view returns (string memory)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
];

// Supported chains configuration
export interface ChainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  contractAddress: string;
  nftContractAddress: string;
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
            nftContractAddress: network.nftContractAddress,
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
    console.log('chainConfig', chainConfig);
    console.log('chainConfig.rpcUrl', chainConfig.rpcUrl);
    if (chainConfig.rpcUrl && chainConfig.rpcUrl.startsWith('http')) {
      return new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl);
    } else if (chainConfig.rpcUrl && chainConfig.rpcUrl.startsWith('ws')) {
      return new ethers.providers.WebSocketProvider(chainConfig.rpcUrl);
    } else {
      throw new Error(`Invalid RPC URL for chain ${chainId}`);
    }
  }

  /**
   * Get contract instance for the specified chain
   */
  private getContract(chainId: string, privateKey: string): ethers.Contract {
    const provider = this.getProvider(chainId);
    const chainConfig = this.chainConfigs[chainId];

    const wallet = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(
      chainConfig.nftContractAddress,
      ERC721_ABI,
      wallet,
    );
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
    httpMetadataUri: string;
  }> {
    console.log(
      'mintNFT',
      chainId,
      privateKey,
      receiverAddress,
      tokenId,
      metadata,
    );
    if (!this.chainConfigs[chainId]) {
      throw new Error(`Chain ${chainId} not supported`);
    }

    // Validate receiver address
    if (!ethers.utils.isAddress(receiverAddress)) {
      throw new Error(`Invalid receiver address: ${receiverAddress}`);
    }

    // สร้าง metadata URI
    const metadataUri = await this.createNFTMetadata(metadata);

    // แปลง IPFS URI เป็น HTTP URL สำหรับใช้งานกับ Smart Contract
    let httpMetadataUri = metadataUri;
    if (metadataUri.startsWith('ipfs://')) {
      const cid = metadataUri.replace('ipfs://', '');
      httpMetadataUri = `https://peach-tiny-gopher-935.mypinata.cloud/ipfs/${cid}`;
    }

    console.log('httpMetadataUri', httpMetadataUri);

    // สร้าง contract instance
    const contract = this.getContract(chainId, privateKey);
    const chainConfig = this.chainConfigs[chainId];

    const provider = this.getProvider(chainId);
    // console.log('provider', provider);
    const wallet = new ethers.Wallet(privateKey, provider);
    // console.log('wallet', wallet);
    try {
      // เตรียมข้อมูลสำหรับการทำธุรกรรม
      const nonce = await wallet.getTransactionCount();
      const gasPrice = await provider.getGasPrice();

      // เรียก safeMint function โดยกำหนดค่า gas limit เอง
      // ไม่ส่ง tokenId เนื่องจาก contract กำหนดเอง (autoincrement)
      const tx = await contract.safeMint(receiverAddress, httpMetadataUri, {
        gasLimit: 500000, // กำหนดค่า gas limit เป็นค่าที่สูงพอสำหรับการ mint NFT
        nonce: nonce,
        gasPrice: gasPrice.mul(120).div(100), // เพิ่ม gas price อีก 20%
      });
      const receipt = await tx.wait();

      // ดึง event logs เพื่อหา tokenId ที่ถูกสร้างขึ้น
      let mintedTokenId = tokenId; // ใช้ค่าเดิมเป็นค่า default

      // ตรวจสอบ event logs ถ้ามี Transfer event (ERC721 standard)
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (
            parsedLog.name === 'Transfer' &&
            parsedLog.args.to.toLowerCase() === receiverAddress.toLowerCase()
          ) {
            mintedTokenId = parsedLog.args.tokenId.toNumber();
            break;
          }
        } catch (error) {
          // ข้าม log ที่ไม่สามารถ parse ได้
          continue;
        }
      }

      return {
        txHash: receipt.transactionHash,
        tokenId: mintedTokenId,
        contractAddress: chainConfig.nftContractAddress,
        explorerUrl: `${chainConfig.explorerUrl}/tx/${receipt.transactionHash}`,
        metadataUri,
        httpMetadataUri,
      };
    } catch (error) {
      // กรณีที่ยังมีปัญหาเรื่อง gas limit
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        try {
          // ลองใช้วิธีการส่งธุรกรรมโดยตรง
          const data = contract.interface.encodeFunctionData('safeMint', [
            receiverAddress,
            httpMetadataUri,
          ]);

          const nonce = await wallet.getTransactionCount();
          const gasPrice = await provider.getGasPrice();

          // สร้าง transaction แบบกำหนดค่าทุกอย่างเอง
          const tx = await wallet.sendTransaction({
            to: chainConfig.nftContractAddress,
            data: data,
            gasLimit: 1000000, // กำหนดค่า gas limit สูงขึ้น
            nonce: nonce,
            gasPrice: gasPrice.mul(150).div(100), // เพิ่ม gas price อีก 50% เพื่อให้แน่ใจว่าธุรกรรมจะสำเร็จ
          });

          const receipt = await tx.wait();

          // ดึง event logs เพื่อหา tokenId ที่ถูกสร้างขึ้น
          let mintedTokenId = tokenId; // ใช้ค่าเดิมเป็นค่า default

          // ตรวจสอบ event logs ถ้ามี Transfer event (ERC721 standard)
          for (const log of receipt.logs) {
            try {
              const parsedLog = contract.interface.parseLog(log);
              if (
                parsedLog.name === 'Transfer' &&
                parsedLog.args.to.toLowerCase() ===
                receiverAddress.toLowerCase()
              ) {
                mintedTokenId = parsedLog.args.tokenId.toNumber();
                break;
              }
            } catch (error) {
              // ข้าม log ที่ไม่สามารถ parse ได้
              continue;
            }
          }

          return {
            txHash: receipt.transactionHash,
            tokenId: mintedTokenId,
            contractAddress: chainConfig.nftContractAddress,
            explorerUrl: `${chainConfig.explorerUrl}/tx/${receipt.transactionHash}`,
            metadataUri,
            httpMetadataUri,
          };
        } catch (innerError) {
          // ถ้ายังมีปัญหาอีก ให้โยนข้อผิดพลาดพร้อมรายละเอียดที่ชัดเจน
          throw new Error(
            `Failed to mint NFT: ${innerError.message || innerError}`,
          );
        }
      }

      // หากไม่ใช่ปัญหาเรื่อง gas limit ให้โยนข้อผิดพลาดต่อไป
      throw error;
    }
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
