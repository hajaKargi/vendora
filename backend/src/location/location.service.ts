import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CountryResponseData } from './interfaces/countries-response.interface';
import { CityResponseData } from './interfaces/cities-response.interface';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async getCountries(
    languageId: string = 'en-US',
  ): Promise<CountryResponseData> {
    try {
      const baseUrl = this.configService.get<string>('base.url');
      if (!baseUrl) {
        throw new Error('Base URL is not configured');
      }

      const token = await this.authService.getAccessToken();
      const response: AxiosResponse<CountryResponseData> = await firstValueFrom(
        this.httpService.get(
          `${baseUrl}/AddressCountryRegionTranslations?$filter=LanguageId eq '${languageId}'`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      if (response.status !== 200) {
        throw new Error('Failed to fetch countries');
      }

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch countries', error);
      throw new Error('Failed to fetch countries from D365');
    }
  }

  async getCities(
    countryRegionId: string,
    stateId: string,
    countyId: string,
  ): Promise<CityResponseData> {
    try {
      const baseUrl = this.configService.get<string>('base.url');
      if (!baseUrl) {
        throw new Error('Base URL is not configured');
      }

      const token = await this.authService.getAccessToken();
      const response: AxiosResponse<CityResponseData> = await firstValueFrom(
        this.httpService.get(
          `${baseUrl}/AddressCounties?$filter=CountryRegionId eq '${countryRegionId}' and StateId eq '${stateId}' and CountyId eq '${countyId}'`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      if (response.status !== 200) {
        throw new Error('Failed to fetch cities');
      }

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch cities', error);
      throw new Error('Failed to fetch cities from D365');
    }
  }
}
