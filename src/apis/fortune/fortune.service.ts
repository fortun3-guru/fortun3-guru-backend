import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from 'src/firebase/firebase.service';

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
  txHash: string;
  walletAddress: string;
  raw: any;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class FortuneService {
  private readonly logger = new Logger(FortuneService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly firebaseService: FirebaseService,
  ) {
    this.apiUrl = this.configService.get<string>(
      'FORTUNE_API_URL',
      'https://n8n.fortun3.guru/webhook-test/call-fortune',
    );
    this.apiKey = this.configService.get<string>('FORTUNE_API_KEY', 'winner');
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
        txHash: data.txHash,
        walletAddress: data.walletAddress,
        raw: data.raw,
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
}
