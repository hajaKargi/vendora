import { Controller, Get, Query, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LocationsService } from '../location.service';
import { CityResponseData } from '../interfaces/cities-response.interface';
import { validateRequiredParams } from '../../common/utils/validate-params.util';

@ApiTags('cities')
@ApiBearerAuth()
@Controller('cities')
export class CitiesController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get cities for a county/LGA' })
  @ApiResponse({
    status: 200,
    description: 'Returns cities for the specified county',
  })
  async getCities(
    @Query('countryRegionId') countryRegionId: string,
    @Query('stateId') stateId: string,
    @Query('countyId') countyId: string,
  ): Promise<any[]> {
    try {
      validateRequiredParams({ countryRegionId, stateId, countyId });
      const result = await this.locationsService.getCities(countryRegionId, stateId, countyId);
      if (!result || !('value' in result) || !Array.isArray(result.value) || result.value.length === 0) {
        throw new NotFoundException(`No cities found for the provided parameters`);
      }
      return result.value;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('An error occurred while fetching cities');
    }
  }
}
