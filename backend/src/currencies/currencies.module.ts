import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CurrenciesController } from './currencies.controller';
import { CurrenciesService } from './currencies.service';
import { AuthModule } from '../auth/auth.module'; // If you use AuthService
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, AuthModule, ConfigModule],
  controllers: [CurrenciesController],
  providers: [CurrenciesService],
})
export class CurrenciesModule {}
