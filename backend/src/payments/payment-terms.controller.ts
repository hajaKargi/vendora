import { Controller, Get, Query, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentTermResponseData } from './interface/payment-response.interface';
import { validateRequiredParams } from '../common/utils/validate-params.util';

@ApiTags('payment-terms')
@ApiBearerAuth()
@Controller('payment-terms')
export class PaymentTermsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get payment terms for a company' })
  @ApiResponse({ status: 200, description: 'Returns payment terms' })
  async getPaymentTerms(
    @Query('dataAreaId') dataAreaId: string,
  ): Promise<any[]> {
    try {
      validateRequiredParams({ dataAreaId });
      const result = await this.paymentsService.getPaymentTerms(dataAreaId);
      if (!result || !('value' in result) || !Array.isArray(result.value) || result.value.length === 0) {
        throw new NotFoundException(`No payment terms found for dataAreaId: ${dataAreaId}`);
      }
      return result.value;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('An error occurred while fetching payment terms');
    }
  }
}
