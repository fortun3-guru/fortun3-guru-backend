import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from 'src/firebase/firebase.service';
import { NFTService, NFTMetadata } from 'src/apis/nft/nft.service';
import axios from 'axios';

export interface CallFortuneParams {
  txHash: string;
  walletAddress: string;
  consult: string;
  lang: string;
  receiptId: string;
}

export interface FortuneResponse {
  documentId: string;
  consult: string;
  lang: string;
  sound: string;
  short: string;
  long: string;
}

export interface ConsultResponse {
  id: string;
  consult: string;
  filename: string;
  lang: string;
  short: string;
  long: string;
  sound: string;
  tarot: string;
  tarotName: string;
  txHash: string;
  walletAddress: string;
  raw: any;
  networkName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class FortuneService {
  private readonly logger = new Logger(FortuneService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly privateKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly firebaseService: FirebaseService,
    private readonly nftService: NFTService,
  ) {
    this.apiUrl = this.configService.get<string>(
      'FORTUNE_API_URL',
      'https://n8n.fortun3.guru/webhook-test/call-fortune',
    );
    this.apiKey = this.configService.get<string>('FORTUNE_API_KEY', 'winner');
    this.privateKey = this.configService.get<string>('NFT_MINTER_PRIVATE_KEY');
  }

  /**
   * Call the fortune API to get fortune telling results
   * @param params Call fortune parameters
   * @returns Fortune response
   */
  async callFortune(params: CallFortuneParams): Promise<FortuneResponse[]> {
    try {
      this.logger.log(
        `Calling fortune API with params: ${JSON.stringify(params)}`,
      );

      const response: AxiosResponse<FortuneResponse[]> = await firstValueFrom(
        this.httpService.post<FortuneResponse[]>(this.apiUrl, params, {
          headers: {
            'X-Fortun3-Key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(
        `Fortune API call successful, received ${response.data.length} fortunes`,
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Error calling fortune API: ${axiosError.message}`,
        axiosError.stack,
      );
      throw axiosError;
    }
  }

  /**
   * Get a consult document from Firebase by ID
   * @param id The consult document ID
   * @returns Consult information
   */
  async getConsultById(id: string): Promise<ConsultResponse> {
    try {
      this.logger.log(`Fetching consult with ID: ${id}`);

      const consultDoc = await this.firebaseService.firestore
        .collection('consults')
        .doc(id)
        .get();

      if (!consultDoc.exists) {
        this.logger.warn(`Consult with ID: ${id} not found`);
        throw new NotFoundException(`Consult with ID: ${id} not found`);
      }

      const data = consultDoc.data();

      return {
        id: consultDoc.id,
        consult: data.consult,
        filename: data.filename,
        lang: data.lang,
        short: data.short,
        long: data.long,
        sound: data.sound,
        tarot: data.tarot,
        tarotName: data.tarotName,
        txHash: data.txHash,
        walletAddress: data.walletAddress,
        raw: data.raw,
        networkName: data.networkName,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error fetching consult: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Create and mint an NFT from a consult
   * @param consultId ID of the consult document in Firebase
   * @param receiptId Receipt ID for the transaction
   * @returns Result of the NFT minting process
   */
  async mintNFTFromConsult(
    consultId: string,
    receiptId: string,
  ): Promise<{
    success: boolean;
    txHash?: string;
    tokenId?: number;
    contractAddress?: string;
    explorerUrl?: string;
    metadataUri?: string;
    error?: string;
  }> {
    try {
      this.logger.log(`Creating NFT from consult ID: ${consultId}`);

      // 1. Fetch the consult data
      const consult = await this.getConsultById(consultId);

      if (!consult) {
        throw new NotFoundException(`Consult with ID ${consultId} not found`);
      }

      // 2. Generate a token ID from the receipt ID (using hash for uniqueness)
      const tokenId = this.generateTokenId(receiptId);

      // 3. Create NFT metadata
      const metadata: NFTMetadata = {
        name: consult.tarotName || 'Fortune NFT',
        description: consult.short || '',
        image: consult.tarot, // URL of the tarot image
        attributes: [
          { trait_type: 'Consult Type', value: consult.consult },
          { trait_type: 'Language', value: consult.lang },
          { trait_type: 'Receipt ID', value: receiptId },
          { trait_type: 'Tarot', value: consult.tarotName || '' },
        ],
      };

      // 4. If tarot is not a URL but a path, we need to get the full URL
      const imageUrl = consult.tarot;
      if (
        imageUrl &&
        !imageUrl.startsWith('http') &&
        !imageUrl.startsWith('ipfs')
      ) {
        // Try to download the image
        try {
          const imageResponse = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
          });
          const imageBuffer = Buffer.from(imageResponse.data, 'binary');

          // Upload and update metadata with IPFS URL
          const updatedMetadata =
            await this.nftService.uploadImageAndUpdateMetadata(
              imageBuffer,
              metadata,
            );
          metadata.image = updatedMetadata.image;
        } catch (error) {
          this.logger.warn(
            `Could not process image at ${imageUrl}. Using as is.`,
          );
        }
      }

      // 5. Mint the NFT
      if (!consult.networkName) {
        throw new Error('Network name not specified in consult data');
      }

      if (!consult.walletAddress) {
        throw new Error('Wallet address not specified in consult data');
      }

      const mintResult = await this.nftService.mintNFT(
        consult.networkName, // Chain ID from the consult
        this.privateKey,
        consult.walletAddress, // Receiver address
        tokenId,
        metadata,
      );

      // 6. Store the mint result in Firebase
      await this.firebaseService.firestore.collection('nfts').add({
        consultId,
        receiptId,
        tokenId: mintResult.tokenId,
        txHash: mintResult.txHash,
        contractAddress: mintResult.contractAddress,
        metadataUri: mintResult.metadataUri,
        createdAt: new Date(),
        walletAddress: consult.walletAddress,
        networkName: consult.networkName,
      });

      return {
        success: true,
        ...mintResult,
      };
    } catch (error) {
      this.logger.error(`Error minting NFT: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generates a unique token ID from a receipt ID
   * @param receiptId The receipt ID
   * @returns A number to use as token ID
   */
  private generateTokenId(receiptId: string): number {
    // Create a deterministic but unique token ID from the receipt ID
    // This is a simple hash function that converts a string to a positive integer
    let hash = 0;
    for (let i = 0; i < receiptId.length; i++) {
      const char = receiptId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
