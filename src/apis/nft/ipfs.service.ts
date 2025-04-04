import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NFTMetadata } from './nft.service';
import axios from 'axios';
import * as FormData from 'form-data';

@Injectable()
export class IPFSService {
  private readonly logger = new Logger(IPFSService.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly gateway: string;
  private readonly baseUrl = 'https://api.pinata.cloud';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('IPFS_API_KEY');
    this.apiSecret = this.configService.get<string>('IPFS_API_SECRET');
    this.gateway = this.configService.get<string>('IPFS_GATEWAY');

    if (!this.apiKey || !this.apiSecret) {
      this.logger.warn(
        'Pinata API credentials not configured. Using mock IPFS service.',
      );
    } else {
      this.testAuthentication();
    }
  }

  /**
   * ทดสอบการเชื่อมต่อกับ Pinata
   */
  private async testAuthentication() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/data/testAuthentication`,
        {
          headers: this.getHeaders(),
        },
      );

      if (response.status === 200) {
        this.logger.log('Successfully connected to Pinata');
      }
    } catch (error) {
      this.logger.error('Pinata authentication failed', error);
    }
  }

  /**
   * สร้าง HTTP headers สำหรับ API request
   */
  private getHeaders() {
    return {
      pinata_api_key: this.apiKey,
      pinata_secret_api_key: this.apiSecret,
    };
  }

  /**
   * อัพโหลด metadata ไปยัง IPFS ผ่าน Pinata
   */
  async uploadMetadata(metadata: NFTMetadata): Promise<string> {
    try {
      if (!this.apiKey || !this.apiSecret) {
        return this.mockUploadMetadata(metadata);
      }

      const response = await axios.post(
        `${this.baseUrl}/pinning/pinJSONToIPFS`,
        {
          pinataContent: metadata,
          pinataMetadata: {
            name: `NFT-Metadata-${metadata.name}-${Date.now()}`,
          },
        },
        {
          headers: this.getHeaders(),
        },
      );

      if (response.status === 200) {
        const hash = response.data.IpfsHash;
        this.logger.log(`Uploaded metadata to Pinata with hash: ${hash}`);
        return `ipfs://${hash}`;
      }

      throw new Error('Failed to upload metadata to Pinata');
    } catch (error) {
      this.logger.error('Failed to upload metadata to Pinata', error);
      return this.mockUploadMetadata(metadata);
    }
  }

  /**
   * อัพโหลดไฟล์รูปภาพไปยัง IPFS ผ่าน Pinata
   */
  async uploadImage(imageBuffer: Buffer): Promise<string> {
    try {
      if (!this.apiKey || !this.apiSecret) {
        return this.mockUploadImage(imageBuffer);
      }

      const formData = new FormData();
      formData.append('file', imageBuffer, {
        filename: `nft-image-${Date.now()}.png`,
        contentType: 'image/png',
      });

      formData.append(
        'pinataMetadata',
        JSON.stringify({
          name: `NFT-Image-${Date.now()}`,
        }),
      );

      const response = await axios.post(
        `${this.baseUrl}/pinning/pinFileToIPFS`,
        formData,
        {
          headers: {
            ...this.getHeaders(),
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
        },
      );

      if (response.status === 200) {
        const hash = response.data.IpfsHash;
        this.logger.log(`Uploaded image to Pinata with hash: ${hash}`);
        return `ipfs://${hash}`;
      }

      throw new Error('Failed to upload image to Pinata');
    } catch (error) {
      this.logger.error('Failed to upload image to Pinata', error);
      return this.mockUploadImage(imageBuffer);
    }
  }

  /**
   * จำลองการอัพโหลด metadata (ใช้เมื่อ Pinata ไม่พร้อมใช้งาน)
   */
  private mockUploadMetadata(metadata: NFTMetadata): string {
    const timestamp = Date.now();
    const mockCid = `bafybeih${timestamp}${Math.floor(Math.random() * 10000)}`;

    this.logger.log('Using mock IPFS service for metadata upload');
    return `ipfs://${mockCid}`;
  }

  /**
   * จำลองการอัพโหลดรูปภาพ (ใช้เมื่อ Pinata ไม่พร้อมใช้งาน)
   */
  private mockUploadImage(imageBuffer: Buffer): string {
    const timestamp = Date.now();
    const mockCid = `bafkreib${timestamp}${Math.floor(Math.random() * 10000)}`;

    this.logger.log(
      `Using mock IPFS service for image upload, size: ${imageBuffer.length} bytes`,
    );
    return `ipfs://${mockCid}`;
  }

  /**
   * แปลง IPFS URI เป็น HTTP URL ที่สามารถเข้าถึงได้
   */
  getHttpUrl(ipfsUri: string): string {
    if (!ipfsUri.startsWith('ipfs://')) {
      return ipfsUri;
    }

    const cid = ipfsUri.replace('ipfs://', '');
    return `${this.gateway}${cid}`;
  }
}
