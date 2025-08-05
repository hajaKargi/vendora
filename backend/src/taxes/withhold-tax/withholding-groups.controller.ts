import { Controller, Get, Query, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { WithholdingGroupsService } from './withholding-groups.service';
import { validateRequiredParams } from '../../common/utils/validate-params.util';

@Controller('withholding-groups')
export class WithholdingGroupsController {
  constructor(private readonly service: WithholdingGroupsService) {}

  @Get()
  async getAll(
    @Query('dataAreaId') dataAreaId: string = '001',
    @Query('company') company: string,
  ) {
    try {
      validateRequiredParams({ dataAreaId, company });
      const result = await this.service.fetchWithholdingGroups(dataAreaId, company);
      if (!result || !('value' in result) || !Array.isArray(result.value) || result.value.length === 0) {
        throw new NotFoundException(`No withholding groups found for dataAreaId: ${dataAreaId}`);
      }
      return result.value;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('An error occurred while fetching withholding groups');
    }
  }
}
