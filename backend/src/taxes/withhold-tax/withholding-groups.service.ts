import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { AxiosResponse } from 'axios';

export interface WithholdingGroup {
  ExcludeCharges: string;
  ApplicableTaxRates: string;
  TaxType: string;
  Transporter: string;
  WithholdingTaxGroupCode: string;
  Description: string;
  dataAreaId: string;
}

export interface WithholdingGroupResponse {
  value: WithholdingGroup[];
}

@Injectable()
export class WithholdingGroupsService {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchWithholdingGroups(
    dataAreaId: string,
    company: string,
  ): Promise<WithholdingGroupResponse> {
    const baseUrl = this.configService.get<string>('base.url');
    if (!baseUrl) throw new Error('Base URL is not configured');

    const token = await this.authService.getAccessToken();

    const url = `${baseUrl}/WithholdingGroups`;
    const params = {
      'cross-company': `${company}`,
      $filter: `dataAreaId eq '${dataAreaId}'`,
    };

    const response: AxiosResponse<WithholdingGroupResponse> =
      await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params,
        }),
      );

    if (response.status !== 200) {
      throw new Error('Failed to fetch withholding groups');
    }

    return response.data;
  }
}
