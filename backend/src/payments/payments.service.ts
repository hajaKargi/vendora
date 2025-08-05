import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { PaymentTermResponseData } from './interface/payment-response.interface';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async getPaymentTerms(dataAreaId: string): Promise<PaymentTermResponseData> {
    try {
      const baseUrl = this.configService.get<string>('base.url');
      if (!baseUrl) {
        throw new Error('Base URL is not configured');
      }

      const token = await this.authService.getAccessToken();
      const response: AxiosResponse<PaymentTermResponseData> =
        await firstValueFrom(
          this.httpService.get(
            `${baseUrl}/PaymentTerms?cross-company=true&$filter=dataAreaId eq '${dataAreaId}'`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        );

      if (response.status !== 200) {
        throw new Error('Failed to fetch payment terms');
      }

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch payment terms', error);
      throw new Error('Failed to fetch payment terms');
    }
  }
}
