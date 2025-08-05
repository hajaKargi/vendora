import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { VendorPaymentMethodResponse } from '../interfaces/vendor-payment-method-interface';

@Injectable()
export class VendorPaymentMethodsService {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchVendorPaymentMethods(
    dataAreaId: string,
    company: string,
  ): Promise<VendorPaymentMethodResponse> {
    const baseUrl = this.configService.get<string>('base.url');
    if (!baseUrl) throw new Error('Base URL is not configured');

    const token = await this.authService.getAccessToken();

    const url = `${baseUrl}/VendorPaymentMethods`;
    const params = {
      'cross-company': `${company}`,
      $filter: `dataAreaId eq '${dataAreaId}'`,
    };

    const response: AxiosResponse<VendorPaymentMethodResponse> =
      await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }),
      );

    if (response.status !== 200) {
      throw new Error('Failed to fetch vendor payment methods');
    }

    return response.data;
  }
}
