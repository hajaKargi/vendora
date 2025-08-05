import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

export interface Vendor {
  AccountNum: string;
  Name: string;
  dataAreaId: string;
  VendorGroupId: string;
  [key: string]: any; // extendable for extra fields
}

export interface VendorResponse {
  value: Vendor[];
}

@Injectable()
export class VendorsByVendorGroupService {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchVendors(
    dataAreaId: string,
    vendorGroupId: string,
    company: string,
    limit = 20,
    skip = 0,
  ): Promise<{ data: Vendor[]; total: number }> {
    const baseUrl = this.configService.get<string>('base.url');
    if (!baseUrl) throw new Error('Base URL is not configured');

    const token = await this.authService.getAccessToken();

    const url = `${baseUrl}/Vendors`;
    const filter = `dataAreaId eq '${dataAreaId}' and VendorGroupId eq '${vendorGroupId}'`;

    const response: AxiosResponse<any> = await firstValueFrom(
      this.httpService.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          'cross-company': `${company}`,
          $filter: filter,
          $top: limit,
          $skip: skip,
          $count: true,
        },
      }),
    );

    if (response.status !== 200) {
      throw new Error('Failed to fetch vendors');
    }

    return {
      data: response.data.value,
      total: response.data['@odata.count'] ?? response.data.value.length,
    };
  }
}
