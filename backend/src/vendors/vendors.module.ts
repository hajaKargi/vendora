import { Module } from '@nestjs/common';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { VendorPaymentMethodsController } from './vendor-payment-method/vendor-payment-methods.controller';
import { VendorPaymentMethodsService } from './vendor-payment-method/vendor-payment-methods-service';
import { VendorGroupsController } from './vendor-group/vendor-groups.controller';
import { VendorGroupsService } from './vendor-group/vendor-groups.service';
import { VendorsByVnedorGroupController } from './vendor-group/vendors-by-vendorgroup.controller';
import { VendorsByVendorGroupService } from './vendor-group/vendors-by-vendorgroup.service';
import { SmtpEmailService } from '../common/email/smtp-email.service';
import { EmailNotificationService } from '../common/email/email-notification.service';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [
    VendorsController,
    VendorPaymentMethodsController,
    VendorGroupsController,
    VendorsByVnedorGroupController,
  ],
  providers: [
    VendorsService,
    VendorPaymentMethodsService,
    VendorGroupsService,
    VendorsByVendorGroupService,
    SmtpEmailService,
    EmailNotificationService,
  ],
  exports: [VendorsService, VendorPaymentMethodsService, VendorGroupsService],
})
export class VendorsModule {}
