import { Controller, Get, Query, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TaxesService } from '../taxes.service';
import { SalesTaxGroupResponseData } from '../interfaces/sales-tax-group-response.interface';
import { validateRequiredParams } from '../../common/utils/validate-params.util';

@ApiTags('sales-tax')
@ApiBearerAuth()
@Controller('sales-tax')
export class SalesTaxController {
  constructor(private readonly taxesService: TaxesService) {}

  @Get('groups')
  @ApiOperation({ summary: 'Get sales tax groups for a company' })
  @ApiResponse({ status: 200, description: 'Returns sales tax groups' })
  async getSalesTaxGroups(
    @Query('dataAreaId') dataAreaId: string,
  ): Promise<any[]> {
    try {
      validateRequiredParams({ dataAreaId });
      const result = await this.taxesService.getSalesTaxGroups(dataAreaId);
      if (!result || !('value' in result) || !Array.isArray(result.value) || result.value.length === 0) {
        throw new NotFoundException(`No sales tax groups found for dataAreaId: ${dataAreaId}`);
      }
      return result.value;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('An error occurred while fetching sales tax groups');
    }
  }
}
