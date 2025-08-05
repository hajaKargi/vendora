import { Controller, Get, Query, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TaxesService } from '../taxes.service';
import { TaxAuthorityResponseData } from '../interfaces/tax-authority-response.interface';
import { validateRequiredParams } from '../../common/utils/validate-params.util';

@ApiTags('tax-authorities')
@ApiBearerAuth()
@Controller('tax-authorities')
export class TaxAuthoritiesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Get()
  @ApiOperation({ summary: 'Get tax authorities for a company' })
  @ApiResponse({ status: 200, description: 'Returns tax authorities' })
  async getTaxAuthorities(
    @Query('dataAreaId') dataAreaId: string,
  ): Promise<any[]> {
    try {
      validateRequiredParams({ dataAreaId });
      const result = await this.taxesService.getTaxAuthorities(dataAreaId);
      if (!result || !('value' in result) || !Array.isArray(result.value) || result.value.length === 0) {
        throw new NotFoundException(`No tax authorities found for dataAreaId: ${dataAreaId}`);
      }
      return result.value;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('An error occurred while fetching tax authorities');
    }
  }
}
