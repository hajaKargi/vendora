import { Controller, Get, Query, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { VendorGroupsService } from './vendor-groups.service';
import { validateRequiredParams } from '../../common/utils/validate-params.util';

@Controller('vendor-groups')
export class VendorGroupsController {
  constructor(private readonly service: VendorGroupsService) {}

  @Get()
  async getAll(
    @Query('dataAreaId') dataAreaId: string = '001',
    @Query('company') company: string = 'true',
  ) {
    try {
      validateRequiredParams({ dataAreaId, company });
      const result = await this.service.fetchVendorGroups(dataAreaId, company);
      if (!result || !('value' in result) || !Array.isArray(result.value) || result.value.length === 0) {
        throw new NotFoundException(`No vendor groups found for dataAreaId: ${dataAreaId}`);
      }
      return result.value;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('An error occurred while fetching vendor groups');
    }
  }
}
