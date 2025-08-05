import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DataEntitiesModule } from './data-entities/data-entities.module';
import { TaxesModule } from './taxes/taxes.module';
import { PaymentsModule } from './payments/payments.module';
import { LocationModule } from './location/location.module';
import { VendorsModule } from './vendors/vendors.module';
import { VendorBankAccountsModule } from './vendor-bank-accounts/vendor-bank-accounts.module';
import { CurrenciesModule } from './currencies/currencies.module';
import authConfig from './config/auth.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig],
      envFilePath: ['.env'],
    }),
    AuthModule,
    DataEntitiesModule,
    TaxesModule,
    PaymentsModule,
    LocationModule,
    VendorsModule,
    VendorBankAccountsModule,
    CurrenciesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
