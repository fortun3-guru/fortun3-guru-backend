import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';

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

@Injectable()
export class FortuneService {
  private readonly logger = new Logger(FortuneService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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
}
