import { Test, TestingModule } from '@nestjs/testing';
import { CountriesController } from './countries.controller';
import { LocationsService } from '../location.service';
import { NotFoundException } from '@nestjs/common';
import { CountryResponseData } from '../interfaces/countries-response.interface';

describe('CountriesController', () => {
  let controller: CountriesController;
  let locationsService: LocationsService;

  const mockCountries = [
    { id: 1, name: 'Country A' },
    { id: 2, name: 'Country B' },
  ];

  const mockLocationsService = {
    getCountries: jest.fn().mockImplementation(async (languageId?: string) => {
      return mockCountries;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountriesController],
      providers: [
        { provide: LocationsService, useValue: mockLocationsService },
      ],
    }).compile();

    controller = module.get<CountriesController>(CountriesController);
    locationsService = module.get<LocationsService>(LocationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCountries', () => {
    beforeEach(() => {
      // Always reset the mock to return mockCountries before each test
      (locationsService.getCountries as jest.Mock).mockResolvedValue([...mockCountries]);
    });

    it('should return a list of countries (array)', async () => {
      // Ensure the mock returns countries for this test
      (locationsService.getCountries as jest.Mock).mockResolvedValueOnce([...mockCountries]);
      const result = await controller.getCountries('en-US');
      expect(result).toEqual(mockCountries);
      expect(locationsService.getCountries).toHaveBeenCalledWith('en-US');
    });

    it('should use the default languageId if none is provided', async () => {
      (locationsService.getCountries as jest.Mock).mockResolvedValueOnce([...mockCountries]);
      const result = await controller.getCountries();
      expect(result).toEqual(mockCountries);
      expect(locationsService.getCountries).toHaveBeenCalledWith('en-US');
    });

    it('should throw NotFoundException if no countries found', async () => {
      jest.spyOn(locationsService, 'getCountries').mockResolvedValueOnce([] as unknown as CountryResponseData);
      await expect(controller.getCountries('en-US')).rejects.toThrow(NotFoundException);
    });
  });
});
