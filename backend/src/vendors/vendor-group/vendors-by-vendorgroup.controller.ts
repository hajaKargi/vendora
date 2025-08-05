import { Controller, Get, Query, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { VendorsByVendorGroupService } from './vendors-by-vendorgroup.service';
import { validateRequiredParams } from '../../common/utils/validate-params.util';

@Controller('vendors-by-group')
export class VendorsByVnedorGroupController {
  constructor(private readonly service: VendorsByVendorGroupService) {}

  @Get()
  async getAll(
    @Query('dataAreaId') dataAreaId: string = '001',
    @Query('vendorGroupId') vendorGroupId: string = 'DEFAULT',
    @Query('company') company: string = 'true',
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ): Promise<{ data: any[]; total: number }> {
    try {
      validateRequiredParams({ dataAreaId, vendorGroupId, company });
      const lim = limit !== undefined ? Number(limit) : 20;
      const skp = skip !== undefined ? Number(skip) : 0;
      const result = await this.service.fetchVendors(dataAreaId, vendorGroupId, company, lim, skp);
      if (!result.data || result.data.length === 0) {
        throw new NotFoundException(`No vendors found for dataAreaId: ${dataAreaId}, vendorGroupId: ${vendorGroupId}`);
      }
      return result;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('An error occurred while fetching vendors by group');
    }
  }
}
