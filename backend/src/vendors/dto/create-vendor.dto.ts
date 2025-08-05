import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateVendorDto {
  @ApiProperty({
    example: '001',
    description: 'Legal entity (dataAreaId) code',
  })
  @IsString()
  @IsNotEmpty()
  dataAreaId: string;

  @ApiProperty({
    example: 'James Don Enterprises Upgraded',
    description: 'Vendor name',
  })
  @IsString()
  @IsNotEmpty()
  VendorName: string;

  @ApiProperty({
    example: 'BROKERS',
    description: 'Vendor group ID (must exist in D365FO)',
  })
  @IsString()
  @IsNotEmpty()
  VendorGroupId: string;

  @ApiProperty({
    example: 'Person',
    description: 'Type of vendor party (Person or Organization)',
  })
  @IsString()
  @IsNotEmpty()
  VendorPartyType: string;

  @ApiPropertyOptional({
    example: 'NGN',
    description: 'Currency code',
  })
  @IsOptional()
  @IsString()
  CurrencyCode?: string;

  @ApiPropertyOptional({ example: 'en-US', description: 'Language ID' })
  @IsOptional()
  @IsString()
  LanguageId?: string;

  @ApiPropertyOptional({
    example: 'Upgraded',
    description: 'Person last name (if VendorPartyType is Person)',
  })
  @IsOptional()
  @IsString()
  PersonLastName?: string;

  @ApiPropertyOptional({
    example: 'Don Enterprises',
    description: 'Person middle name (if VendorPartyType is Person)',
  })
  @IsOptional()
  @IsString()
  PersonMiddleName?: string;

  @ApiPropertyOptional({
    example: 'James',
    description: 'Person first name (if VendorPartyType is Person)',
  })
  @IsOptional()
  @IsString()
  PersonFirstName?: string;

  @ApiPropertyOptional({
    example: 'vendor@email.com',
    description: 'Primary email address for the vendor',
  })
  @IsOptional()
  @IsString()
  PrimaryEmailAddress?: string;

  @ApiPropertyOptional({
    example: 'VEN20250701',
    description: 'Vendor account number (auto-generated if not provided)',
  })
  @IsOptional()
  @IsString()
  VendorAccountNumber?: string;


  @ApiPropertyOptional({
    example: '12345',
    description: 'SwiftCode for the vendor',
  })
  @IsOptional()
  @IsString()
  swiftCode?: string;

}
