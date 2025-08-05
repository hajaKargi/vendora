import { Module } from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { SalesTaxController } from './sales-tax/sales-tax.controller';
import { TaxAuthoritiesController } from './tax-authorities/tax-authorities.controller';
import { WithholdingGroupsController } from './withhold-tax/withholding-groups.controller';
import { WithholdingGroupsService } from './withhold-tax/withholding-groups.service';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [
    TaxAuthoritiesController,
    SalesTaxController,
    WithholdingGroupsController,
  ],
  providers: [TaxesService, WithholdingGroupsService],
  exports: [TaxesService, WithholdingGroupsService],
})
export class TaxesModule {}
