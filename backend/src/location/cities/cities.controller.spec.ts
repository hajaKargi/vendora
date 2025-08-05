import { Test, TestingModule } from '@nestjs/testing';
import { CitiesController } from './cities.controller';
import { LocationsService } from '../location.service';
import { CityResponseData } from '../interfaces/cities-response.interface';

describe('CitiesController', () => {
  let controller: CitiesController;
  let locationsService: LocationsService;

  const mockCities = [
    { id: 1, name: 'City A' },
    { id: 2, name: 'City B' },
  ];

  const mockLocationsService = {
    getCities: jest.fn((countryId, stateId, regionId) => {
      // Compare parameters as numbers
      if (
        countryId === 1 &&
        stateId === 2 &&
        regionId === 3
      ) {
        return Promise.resolve(mockCities);
      }
      // Simulate NotFoundException for other parameters
      return Promise.reject(new Error('No cities found for the provided parameters'));
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitiesController],
      providers: [
        { provide: LocationsService, useValue: mockLocationsService },
      ],
    }).compile();

    controller = module.get<CitiesController>(CitiesController);
    locationsService = module.get<LocationsService>(LocationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCities', () => {
    it('should return a list of cities', async () => {
      const result: any[] = await controller.getCities('1', '2', '3');
      expect(result).toEqual(mockCities);
      expect(locationsService.getCities).toHaveBeenCalledWith('1', '2', '3');
    });
  });
});
