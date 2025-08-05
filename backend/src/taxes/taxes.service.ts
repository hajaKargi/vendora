import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TaxAuthorityResponseData } from './interfaces/tax-authority-response.interface';
import { SalesTaxGroupResponseData } from './interfaces/sales-tax-group-response.interface';

@Injectable()
export class TaxesService {
  private readonly logger = new Logger(TaxesService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async getTaxAuthorities(
    dataAreaId: string,
  ): Promise<TaxAuthorityResponseData> {
    try {
      const baseUrl = this.configService.get<string>('base.url');
      if (!baseUrl) {
        throw new Error('Base URL is not configured');
      }

      const token = await this.authService.getAccessToken();
      const response: AxiosResponse<TaxAuthorityResponseData> =
        await firstValueFrom(
          this.httpService.get(
            `${baseUrl}/TaxAuthorities?cross-company=true&$filter=dataAreaId eq '${dataAreaId}'`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        );

      if (response.status !== 200) {
        throw new Error('Failed to fetch tax authorities');
      }

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch tax authorities', error);
      throw new Error('Failed to fetch tax authorities from D365');
    }
  }

  async getSalesTaxGroups(
    dataAreaId: string,
  ): Promise<SalesTaxGroupResponseData> {
    try {
      const baseUrl = this.configService.get<string>('base.url');
      if (!baseUrl) {
        throw new Error('Base URL is not configured');
      }

      const token = await this.authService.getAccessToken();
      const response: AxiosResponse<SalesTaxGroupResponseData> =
        await firstValueFrom(
          this.httpService.get(
            `${baseUrl}/DocumentTaxGroupHeadings?cross-company=true&$filter=dataAreaId eq '${dataAreaId}'`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          ),
        );

      if (response.status !== 200) {
        throw new Error('Failed to fetch sales tax groups');
      }

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch sales tax groups', error);
      throw new Error('Failed to fetch sales tax groups');
    }
  }
}
