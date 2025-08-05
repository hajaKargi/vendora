import { Test, TestingModule } from '@nestjs/testing';
import { DataEntitiesService } from './data-entities.service';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';

describe('DataEntitiesService', () => {
  let service: DataEntitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataEntitiesService,
        { provide: AuthService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        { provide: require('@nestjs/axios').HttpService, useValue: {} },
      ],
    }).compile();

    service = module.get<DataEntitiesService>(DataEntitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
