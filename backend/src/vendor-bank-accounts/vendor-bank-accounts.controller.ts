import { Controller, Get, NotFoundException, InternalServerErrorException, BadRequestException } from "@nestjs/common"
import { VendorBankAccountsService } from "./vendor-bank-accounts.service"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { VendorBankAccountResponseData } from "./interfaces/vendor-bank-account-response.interface"

@ApiTags("vendor-bank-accounts")
@ApiBearerAuth()
@Controller("vendor-bank-accounts")
export class VendorBankAccountsController {
  constructor(private readonly vendorBankAccountsService: VendorBankAccountsService) {}

  @Get()
  @ApiOperation({ summary: "Get all vendor bank accounts" })
  @ApiResponse({ status: 200, description: "Returns all vendor bank accounts" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getVendorBankAccounts() {
    try {
      const result = await this.vendorBankAccountsService.getVendorBankAccounts();
      if (!result || !('value' in result) || !Array.isArray(result.value) || result.value.length === 0) {
        throw new NotFoundException('No vendor bank accounts found');
      }
      return result.value;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('An error occurred while fetching vendor bank accounts');
    }
  }
}
