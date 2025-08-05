import { Controller, Get, Query, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AddressStatesService } from './address-states.service';
import { validateRequiredParams } from '../../common/utils/validate-params.util';

@Controller('address-states')
export class AddressStatesController {
  constructor(private readonly service: AddressStatesService) {}

  @Get()
  async getAll(@Query('countryRegionId') countryRegionId: string = 'NGA') {
    try {
      validateRequiredParams({ countryRegionId });
      const result = await this.service.fetchAddressStates(countryRegionId);
      if (!result || !('value' in result) || !Array.isArray(result.value) || result.value.length === 0) {
        throw new NotFoundException(`No address states found for countryRegionId: ${countryRegionId}`);
      }
      return result.value;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('An error occurred while fetching address states');
    }
  }
}
