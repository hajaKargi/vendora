import { Test, TestingModule } from '@nestjs/testing';
import { DataEntitiesController } from './data-entities.controller';
import { DataEntitiesService } from './data-entities.service';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

// Create a mock AuthService
const mockAuthService = {
  getAccessToken: jest.fn().mockResolvedValue('mock-token'),
};

// Create a mock ConfigService
const mockConfigService = {
  get: jest.fn().mockReturnValue('mock-base-url'),
};

// Create a mock HttpService
const mockHttpService = {
  get: jest.fn(),
};

describe('DataEntitiesController', () => {
  let controller: DataEntitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataEntitiesController],
      providers: [
        {
          provide: DataEntitiesService,
          useFactory: () =>
            new DataEntitiesService(
              mockAuthService as any,
              mockConfigService as any,
              mockHttpService as any
            ),
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    controller = module.get<DataEntitiesController>(DataEntitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
