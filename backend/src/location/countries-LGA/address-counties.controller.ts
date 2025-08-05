import { Controller, Get, Query, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AddressCountiesService } from './address-counties.service';
import { validateRequiredParams } from '../../common/utils/validate-params.util';

@Controller('address-counties')
export class AddressCountiesController {
  constructor(private readonly service: AddressCountiesService) {}

  @Get()
  async getAll(
    @Query('countryRegionId') countryRegionId: string = 'NGA',
    @Query('stateId') stateId: string = 'Lagos',
  ) {
    try {
      validateRequiredParams({ countryRegionId, stateId });
      const result = await this.service.fetchAddressCounties(countryRegionId, stateId);
      if (!result || !('value' in result) || !Array.isArray(result.value) || result.value.length === 0) {
        throw new NotFoundException(`No address counties found for countryRegionId: ${countryRegionId}, stateId: ${stateId}`);
      }
      return result.value;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('An error occurred while fetching address counties');
    }
  }
}
