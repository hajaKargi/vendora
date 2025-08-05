import {
  Controller,
  Get,
  Param,
  NotFoundException,
  InternalServerErrorException,
  Body,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { VendorResponse } from './interfaces/vendor-response.interface';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { validateRequiredParams } from '../common/utils/validate-params.util';

@ApiTags('vendors')
@ApiBearerAuth()
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}
  @Get(':vendorAccountNumber')
  @ApiOperation({
    summary: 'Get a vendor by VendorAccountNumber and optional dataAreaId',
    description: 'Retrieves a specific vendor using their account number. You can optionally specify a dataAreaId.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the vendor information',
    schema: {
      example: {
        VendorAccountNumber: "VEND-001",
        Name: "Vendor Name",
        VendorGroupId: "BROKERS",
        dataAreaId: "001",
      }
    }
  })
  @ApiBadRequestResponse({
    description: 'Missing or invalid required parameter(s)',
    schema: {
      example: {
        statusCode: 400,
        message: 'Missing or invalid required parameter(s): dataAreaId',
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Vendor not found',
    schema: {
      example: {
        statusCode: 404,
        message: "Vendor 'VEND-001' not found in dataArea '001'",
        error: 'Not Found',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'An unexpected error occurred while fetching the vendor',
        error: 'Internal Server Error',
      },
    },
  })
  async findOne(
    @Param('vendorAccountNumber') vendorAccountNumber: string,
    @Query('dataAreaId') dataAreaId?: string,
  ): Promise<VendorResponse> {
    validateRequiredParams({ vendorAccountNumber });
    try {
      const vendor = await this.vendorsService.findOne(vendorAccountNumber, dataAreaId);
      if (!vendor) {
        throw new NotFoundException(`Vendor '${vendorAccountNumber}' not found in dataArea '${dataAreaId}'`);
      }
      return vendor;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred while fetching the vendor');
    }
  }

  //findAll Vendors  
  @Get()
  @ApiOperation({
    summary: 'Get all vendors',
    description: 'Retrieves all vendors from the system across all data areas with pagination support'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns array of all vendors',
    schema: {
      example: [{
        VendorAccountNumber: "VEND-001",
        Name: "Vendor Name",
        VendorGroupId: "BROKERS",
        dataAreaId: "001"
      },
      {
        VendorAccountNumber: "VEND-002",
        Name: "Another Vendor",
        VendorGroupId: "GENERAL",
        dataAreaId: "002"
      }]
    }
  })
  @ApiBadRequestResponse({
    description: 'Missing or invalid required parameter(s)',
    schema: {
      example: {
        statusCode: 400,
        message: 'Missing or invalid required parameter(s): dataAreaId',
        error: 'Bad Request',
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Unexpected server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'An error occurred while fetching vendors',
        error: 'Internal Server Error',
      },
    },
  })
  async findAll(
    @Query('limit') limit?: number,
    @Query('skip') skip?: number,
  ): Promise<{ data: VendorResponse[]; total: number }> {
    try {
      // Default values if not provided
      const lim = limit !== undefined ? Number(limit) : 20;
      const skp = skip !== undefined ? Number(skip) : 0;
      const result = await this.vendorsService.findAll(lim, skp);
      if (!result.data || result.data.length === 0) {
        throw new NotFoundException('No vendors found');
      }
      return result;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred while fetching the vendors');
    }
  }  
  
  @Post()
  @ApiOperation({
    summary: 'Create a new vendor',
    description: 'Creates a new vendor in the system'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Vendor created successfully',
    schema: {
      example: {
        VendorAccountNumber: "VEND-003",
        Name: "New Vendor",
        VendorGroupId: "GENERAL",
        dataAreaId: "001",
        Status: "Active"
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad Request - Invalid vendor data',
    schema: {
      example: {
        statusCode: 400,
        message: ['VendorAccountNumber is required', 'Name must be a string'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createVendor(@Body() dto: CreateVendorDto): Promise<any> {
    return await this.vendorsService.createVendor(dto);
  }
 
}


