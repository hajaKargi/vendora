import { Controller, Get, Query, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LocationsService } from '../location.service';
import { CountryResponseData } from '../interfaces/countries-response.interface';
import { validateRequiredParams } from '../../common/utils/validate-params.util';

@ApiTags('countries')
@ApiBearerAuth()
@Controller('countries')
export class CountriesController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all countries' })
  @ApiResponse({ status: 200, description: 'Returns all countries' })
  async getCountries(
    @Query('languageId') languageId: string = 'en-US',
  ): Promise<any[]> {
    try {
      validateRequiredParams({ languageId });
      const result = await this.locationsService.getCountries(languageId);
      if (!result || !('value' in result) || !Array.isArray(result.value) || result.value.length === 0) {
        throw new NotFoundException(`No countries found for languageId: ${languageId}`);
      }
      return result.value;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('An error occurred while fetching countries');
    }
  }
}
