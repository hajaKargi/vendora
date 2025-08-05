import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRequestDto, TokenResponse } from './dto/auth-request.dto';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

@Injectable()
export class AuthService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private async fetchToken(): Promise<void> {
    const dto: AuthRequestDto = {
      grant_type: this.configService.get<string>('auth.grantType') || '',
      client_id: this.configService.get<string>('auth.clientId') || '',
      client_secret: this.configService.get<string>('auth.clientSecret') || '',
      resource: this.configService.get<string>('auth.resource') || '',
    };

    const form = new FormData();
    form.append('grant_type', dto.grant_type);
    form.append('client_id', dto.client_id);
    form.append('client_secret', dto.client_secret);
    form.append('resource', dto.resource);

    const authUrl = this.configService.get<string>('auth.url');
    if (!authUrl) {
      throw new Error('Auth URL is not configured');
    }

    const response: AxiosResponse<TokenResponse> = await firstValueFrom(
      this.httpService.post(authUrl, form, {
        headers: form.getHeaders(),
      }),
    );

    const data = response.data;

    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + Number(data.expires_in) * 1000;
  }

  async getAccessToken(): Promise<string> {
    if (
      !this.accessToken ||
      !this.tokenExpiry ||
      Date.now() > this.tokenExpiry
    ) {
      await this.fetchToken();
    }
    return this.accessToken!;
  }
}
