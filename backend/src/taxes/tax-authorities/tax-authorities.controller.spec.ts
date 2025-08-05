import { Test, TestingModule } from '@nestjs/testing';
import { TaxAuthoritiesController } from './tax-authorities.controller';
import { TaxesService } from '../taxes.service';

describe('TaxAuthoritiesController', () => {
  let controller: TaxAuthoritiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxAuthoritiesController],
      providers: [
        {
          provide: TaxesService,
          useValue: {
            getTaxAuthorities: jest.fn(),
            someDependency: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TaxAuthoritiesController>(TaxAuthoritiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
