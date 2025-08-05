import { Controller, Get, Query, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { VendorPaymentMethodsService } from './vendor-payment-methods-service';
import { validateRequiredParams } from '../../common/utils/validate-params.util';

@Controller('vendor-payment-methods')
export class VendorPaymentMethodsController {
  constructor(private readonly service: VendorPaymentMethodsService) {}

  @Get()
  async getAll(
    @Query('dataAreaId') dataAreaId: string = '001',
    @Query('company') company: string = 'true',
  ) {
    try {
      validateRequiredParams({ dataAreaId, company });
      const result = await this.service.fetchVendorPaymentMethods(dataAreaId, company);
      if (!result || !('value' in result) || !Array.isArray(result.value) || result.value.length === 0) {
        throw new NotFoundException(`No vendor payment methods found for dataAreaId: ${dataAreaId}`);
      }
      return result.value;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('An error occurred while fetching vendor payment methods');
    }
  }
}
