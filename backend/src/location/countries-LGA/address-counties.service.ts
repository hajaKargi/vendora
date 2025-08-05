import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

export interface AddressCounty {
  CountyId: string;
  Name: string;
  StateId: string;
  CountryRegionId: string;
}

export interface AddressCountyResponse {
  value: AddressCounty[];
}

@Injectable()
export class AddressCountiesService {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchAddressCounties(
    countryRegionId: string,
    stateId: string,
  ): Promise<AddressCountyResponse> {
    const baseUrl = this.configService.get<string>('base.url');
    if (!baseUrl) throw new Error('Base URL is not configured');

    const token = await this.authService.getAccessToken();

    const url = `${baseUrl}/AddressCounties`;
    const filter = `CountryRegionId eq '${countryRegionId}' and StateId eq '${stateId}'`;

    const response: AxiosResponse<AddressCountyResponse> = await firstValueFrom(
      this.httpService.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: { $filter: filter },
      }),
    );

    if (response.status !== 200) {
      throw new Error('Failed to fetch address counties');
    }

    return response.data;
  }
}
