import { Controller, Get, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CurrenciesService } from './currencies.service';
import { CurrencyResponse } from './interfaces/currency-response.interface';

@ApiTags('currencies')
@ApiBearerAuth()
@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all currencies' })
  @ApiResponse({ status: 200, description: 'Returns all currencies' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(): Promise<any[]> {
    try {
      const result = await this.currenciesService.findAll();
      if (!result || !('value' in result) || !Array.isArray(result.value) || result.value.length === 0) {
        throw new NotFoundException('No currencies found');
      }
      return result.value;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'An error occurred while fetching currencies',
      );
    }
  }
}
