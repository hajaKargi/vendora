import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface valueResponse {
  DataArea: string;
  Name: string;
  KnownAs: string;
  LanguageId: string;
  PartyNumber: string;
}

export interface DataEntityResponse {
  value: valueResponse[];
}

@Injectable()
export class DataEntitiesService {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  public async fetchDataEntities(): Promise<DataEntityResponse> {
    const BaseUrl = this.configService.get<string>('base.url');
    if (!BaseUrl) {
      throw new Error('Auth URL is not configured');
    }

    const token = await this.authService.getAccessToken();
    const response: AxiosResponse<DataEntityResponse> = await firstValueFrom(
      this.httpService.get(`${BaseUrl}/Companies`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );

    if (response.status !== 200) {
      throw new Error('Failed to fetch data entities');
    }

    return response.data;
  }
}
