import { Module } from "@nestjs/common"
import { HttpModule } from "@nestjs/axios"
import { VendorBankAccountsController } from "./vendor-bank-accounts.controller"
import { VendorBankAccountsService } from "./vendor-bank-accounts.service"
import { ConfigModule } from "@nestjs/config"
import { AuthModule } from "src/auth/auth.module"

@Module({
  imports: [HttpModule, ConfigModule, AuthModule],
  controllers: [VendorBankAccountsController],
  providers: [VendorBankAccountsService],
  exports: [VendorBankAccountsService],
})
export class VendorBankAccountsModule {}
