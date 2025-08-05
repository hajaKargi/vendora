import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { CurrencyResponse } from './interfaces/currency-response.interface';

@Injectable()
export class CurrenciesService {
  private readonly logger = new Logger(CurrenciesService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<CurrencyResponse[]> {
    try {
      const baseUrl = this.configService.get<string>('Base_Url');
      if (!baseUrl) throw new Error('Base URL is not configured');
      const token = await this.authService.getAccessToken();

      const response = await firstValueFrom(
        this.httpService.get(`${baseUrl}/Currencies`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      if (response.status !== 200)
        throw new Error('Failed to fetch currencies');
      const data = response.data as { value: CurrencyResponse[] };
      return data.value;
    } catch (error) {
      this.logger.error('Failed to fetch currencies', error);
      throw new Error('Failed to fetch currencies');
    }
  }
}
