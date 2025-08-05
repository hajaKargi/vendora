import { Test, TestingModule } from '@nestjs/testing';
import { SalesTaxController } from './sales-tax.controller';
import { TaxesService } from '../taxes.service';

describe('SalesTaxController', () => {
  let controller: SalesTaxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesTaxController],
      providers: [
        {
          provide: TaxesService,
          useValue: {
            getSalesTaxGroups: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SalesTaxController>(SalesTaxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
