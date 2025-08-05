import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { VendorGroupResponse } from '../interfaces/vendor-group.interface';

@Injectable()
export class VendorGroupsService {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchVendorGroups(
    dataAreaId: string,
    company: string,
  ): Promise<VendorGroupResponse> {
    const baseUrl = this.configService.get<string>('base.url');
    if (!baseUrl) throw new Error('Base URL is not configured');

    const token = await this.authService.getAccessToken();

    const url = `${baseUrl}/VendorGroups`;
    const filter = `dataAreaId eq '${dataAreaId}'`;

    const response: AxiosResponse<VendorGroupResponse> = await firstValueFrom(
      this.httpService.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          'cross-company': `${company}`,
          $filter: filter,
        },
      }),
    );

    if (response.status !== 200) {
      throw new Error('Failed to fetch vendor groups');
    }

    return response.data;
  }
}
