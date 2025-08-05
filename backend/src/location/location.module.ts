import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { CountriesController } from './countries/countries.controller';
import { CitiesController } from './cities/cities.controller';
import { LocationsService } from './location.service';
import { AddressStatesService } from './state/address-states.service';
import { AddressStatesController } from './state/address-states.controller';
import { AddressCountiesService } from './countries-LGA/address-counties.service';
import { AddressCountiesController } from './countries-LGA/address-counties.controller';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [
    CountriesController,
    CitiesController,
    AddressStatesController,
    AddressCountiesController,
  ],
  providers: [LocationsService, AddressStatesService, AddressCountiesService],
  exports: [LocationsService, AddressStatesService, AddressCountiesService],
})
export class LocationModule {}
