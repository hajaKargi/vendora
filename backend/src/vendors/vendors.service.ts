/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { VendorResponse } from './interfaces/vendor-response.interface';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { EmailNotificationService } from '../common/email/email-notification.service';

@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly emailNotificationService: EmailNotificationService,
  ) {}

  //findOne Vendor
  async findOne(
    vendorAccountNumber: string,
    dataAreaId?: string,
  ): Promise<VendorResponse> {
    const baseUrl = this.configService.get<string>('base.url');
    const resolvedDataAreaId =
      dataAreaId || this.configService.get<string>('dataArea.id') || '001';

    if (!baseUrl) {
      this.logger.error('Base URL is not configured');
      throw new InternalServerErrorException('Base URL is not configured');
    }

    try {
      const token = await this.authService.getAccessToken();

      const response = await firstValueFrom(
        this.httpService.get(`${baseUrl}/Vendors`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            'cross-company': 'true',
            $filter: `dataAreaId eq '${resolvedDataAreaId}' and VendorAccountNumber eq '${vendorAccountNumber}'`,
          },
        }),
      );

      const vendor = response.data?.value?.[0];
      if (!vendor) {
        this.logger.warn(
          `Vendor not found: VendorAccountNumber=${vendorAccountNumber}, dataAreaId=${resolvedDataAreaId}`,
        );
        throw new NotFoundException(
          `Vendor '${vendorAccountNumber}' not found in dataArea '${resolvedDataAreaId}'`,
        );
      }

      return vendor;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Unexpected error while fetching vendor '${vendorAccountNumber}':`,
        error,
      );
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching the vendor',
      );
    }
  }

  
  //findAll Vendors
  async findAll(limit = 20, skip = 0): Promise<{ data: VendorResponse[]; total: number }> {
    try {
      const baseUrl = this.configService.get<string>('base.url');
      if (!baseUrl) throw new Error('Base URL is not configured');
      const dataAreaId = this.configService.get<string>('dataArea.id') || '001';
      const token = await this.authService.getAccessToken();

      const response = await firstValueFrom(
        this.httpService.get(`${baseUrl}/Vendors`, {
          params: {
            'cross-company': 'true',
            $filter: `dataAreaId eq '${dataAreaId}'`,
            $top: limit,
            $skip: skip,
            $count: true,
          },
          headers: { Authorization: `Bearer ${token}` },
        }),
      );

      if (response.status !== 200) throw new Error('Failed to fetch vendors');
      return {
        data: response.data.value,
        total: response.data['@odata.count'] ?? response.data.value.length,
      };
    } catch (error) {
      this.logger.error('Failed to fetch vendors', error);
      throw new Error('Failed to fetch vendors');
    }
  }

  
  async createVendor(dto: CreateVendorDto): Promise<any> {
    const token = await this.authService.getAccessToken();
    const baseUrl = this.configService.get<string>('base.url');

    if (!baseUrl) {
      throw new Error('Base URL is not configured');
    }

    // Check for duplicate vendor in the same dataAreaId using PrimaryEmailAddress
    const dataAreaId = dto.dataAreaId || this.configService.get<string>('dataArea.id') || '001';
    try {
      const existing = await firstValueFrom(
        this.httpService.get(`${baseUrl}/Vendors`, {
          params: {
            'cross-company': 'true',
            $filter: `dataAreaId eq '${dataAreaId}' and PrimaryEmailAddress eq '${dto.PrimaryEmailAddress}'`,
          },
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      if (existing.data?.value && Array.isArray(existing.data.value) && existing.data.value.length > 0) {
        throw new ConflictException(`Vendor with PrimaryEmailAddress '${dto.PrimaryEmailAddress}' already exists in dataArea '${dataAreaId}'`);
      }
    } catch (error) {
      // Only throw if not a 404 (not found), otherwise continue
      if (error instanceof ConflictException) throw error;
      // If error is not a 404, rethrow
      if (error.response && error.response.status !== 404) throw error;
    }

    // Auto-generate VendorAccountNumber if not provided
    let vendorAccountNumber = dto.VendorAccountNumber;
    if (!vendorAccountNumber) {
      // Example: VEN20250731-<random6digits>
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const rand = Math.floor(100000 + Math.random() * 900000);
      vendorAccountNumber = `VEN${dateStr}-${rand}`;
    }

    const payload = { ...dto, VendorAccountNumber: vendorAccountNumber };
    const url = `${baseUrl}/Vendors`;
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, { headers }),
      );
      // Send welcome email after successful creation
      if (dto.PrimaryEmailAddress && dto.VendorName) {
        await this.emailNotificationService.sendVendorWelcomeEmail(dto.PrimaryEmailAddress, dto.VendorName);
      }
      return response.data;
    } catch (error) {
      // Handle DNS/network errors like EAI_AGAIN
      if (error?.cause && error.cause.code === 'EAI_AGAIN') {
        this.logger.error('Network/DNS error while connecting to Dynamics 365', error);
        throw new InternalServerErrorException('Unable to reach Dynamics 365 service. Please try again later.');
      }
      // Handle Dynamics validation errors
      if (error.response && error.response.status === 400 && error.response.data?.error?.innererror?.message) {
        const fullMsg = error.response.data.error.innererror.message;
        // Extract all warnings
        const warnings = fullMsg
          .split(';')
          .map(w => w.trim())
          .filter(w => w.startsWith('Warning:'));
        // Exclude the specific LanguageId warning
        const filteredWarnings = warnings.filter(w => !w.includes("validateField failed on field 'DirPartyBaseEntity.LanguageId'"));
        // Parse warnings into structured breakdown
        const breakdown = filteredWarnings.map(w => {
          // Try to match: The value 'X' in field 'Y' is ...
          const match = w.match(/The value '(.+?)' in field '(.+?)' (.+)/);
          if (match) {
            return {
              field: match[2],
              value: match[1],
              description: match[3].replace('Warning:', '').trim(),
            };
          }
          // Fallback: just return the warning text
          return { description: w.replace('Warning:', '').trim() };
        });
        if (breakdown.length > 0) {
          throw new BadRequestException({ message: 'Validation error', breakdown });
        }
        throw new BadRequestException({ message: 'Invalid or missing data. Please check your input.' });
      }
      this.logger.error('Failed to create vendor', error);
      throw new InternalServerErrorException('Failed to create vendor');
    }
  }

}
