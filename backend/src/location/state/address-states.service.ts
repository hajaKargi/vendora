import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { AddressStateResponse } from '../interfaces/state-responses.interface';

@Injectable()
export class AddressStatesService {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchAddressStates(
    countryRegionId: string,
  ): Promise<AddressStateResponse> {
    const baseUrl = this.configService.get<string>('base.url');
    if (!baseUrl) throw new Error('Base URL is not configured');

    const token = await this.authService.getAccessToken();

    const url = `${baseUrl}/AddressStates`;
    const params = {
      $filter: `CountryRegionId eq '${countryRegionId}'`,
    };

    const response: AxiosResponse<AddressStateResponse> = await firstValueFrom(
      this.httpService.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      }),
    );

    if (response.status !== 200) {
      throw new Error('Failed to fetch address states');
    }

    return response.data;
  }
}
