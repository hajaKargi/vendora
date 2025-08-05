import { Test, TestingModule } from '@nestjs/testing';
import { VendorBankAccountsController } from './vendor-bank-accounts.controller';
import { VendorBankAccountsService } from './vendor-bank-accounts.service';

describe('VendorBankAccountsController', () => {
  let controller: VendorBankAccountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VendorBankAccountsController],
      providers: [
        {
          provide: 'HttpService',
          useValue: {},
        },
        {
          provide: 'AuthService',
          useValue: {},
        },
        {
          provide: 'ConfigService',
          useValue: {},
        },
        {
          provide: VendorBankAccountsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<VendorBankAccountsController>(VendorBankAccountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
