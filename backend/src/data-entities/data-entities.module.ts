import { Module } from '@nestjs/common';
import { DataEntitiesService } from './data-entities.service';
import { DataEntitiesController } from './data-entities.controller';
import { AuthModule } from 'src/auth/auth.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [DataEntitiesController],
  providers: [DataEntitiesService],
  exports: [DataEntitiesService],
})
export class DataEntitiesModule {}
