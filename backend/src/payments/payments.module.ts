import { Module } from '@nestjs/common';
import { PaymentTermsController } from './payment-terms.controller';
import { PaymentsService } from './payments.service';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [PaymentTermsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
