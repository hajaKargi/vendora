import { Controller, Get, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DataEntitiesService } from './data-entities.service';

@Controller('data-entities')
export class DataEntitiesController {
  constructor(private readonly dataEntitiesService: DataEntitiesService) {}

  @Get()
  async findAll() {
    try {
      const result = await this.dataEntitiesService.fetchDataEntities();
      if (!result || !('value' in result) || !Array.isArray(result.value) || result.value.length === 0) {
        throw new NotFoundException('No data entities found');
      }
      return result.value;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('An error occurred while fetching data entities');
    }
  }
}
