import { Test, TestingModule } from '@nestjs/testing';
import { VendorsService } from './vendors.service';
import { HttpService } from '@nestjs/axios';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';

describe('VendorsService', () => {
  let service: VendorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VendorsService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getAccessToken: jest.fn().mockResolvedValue('mock-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'base.url') return 'https://mock-url.com';
              if (key === 'dataArea.id') return 'ARGILE';
              return null;
            }),
          },
        },
        {
          provide: require('../sendgrid-email/sendgrid-email.service').SendGridEmailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VendorsService>(VendorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
