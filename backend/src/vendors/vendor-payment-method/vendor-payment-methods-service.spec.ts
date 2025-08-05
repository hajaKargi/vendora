import { VendorPaymentMethodsService } from './vendor-payment-methods-service'
import { of, throwError } from 'rxjs'

describe('VendorPaymentMethodsService', () => {
  let service: VendorPaymentMethodsService
  let authService: any
  let configService: any
  let httpService: any

  beforeEach(() => {
    authService = { getAccessToken: jest.fn() }
    configService = { get: jest.fn() }
    httpService = { get: jest.fn() }
    service = new VendorPaymentMethodsService(authService, configService, httpService)
  })

  it('should fetch vendor payment methods successfully', async () => {
    const mockBaseUrl = 'http://test'
    const mockToken = 'token'
    const mockData = { value: [] }
    const mockResponse = {
      data: mockData,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    }
    configService.get.mockReturnValue(mockBaseUrl)
    authService.getAccessToken.mockResolvedValue(mockToken)
    httpService.get.mockReturnValue(of(mockResponse))

    const result = await service.fetchVendorPaymentMethods('DAT', 'company1')
    expect(result).toBe(mockData)
    expect(configService.get).toHaveBeenCalledWith('base.url')
    expect(authService.getAccessToken).toHaveBeenCalled()
    expect(httpService.get).toHaveBeenCalledWith(
      `${mockBaseUrl}/VendorPaymentMethods`,
      {
        headers: { Authorization: `Bearer ${mockToken}` },
        params: {
          'cross-company': 'company1',
          $filter: "dataAreaId eq 'DAT'",
        },
      }
    )
  })

  it('should throw if base URL is not configured', async () => {
    configService.get.mockReturnValue(undefined)
    await expect(service.fetchVendorPaymentMethods('DAT', 'company1')).rejects.toThrow('Base URL is not configured')
  })

  it('should throw if response status is not 200', async () => {
    configService.get.mockReturnValue('http://test')
    authService.getAccessToken.mockResolvedValue('token')
    const mockResponse = {
      data: {},
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
      config: {},
    }
    httpService.get.mockReturnValue(of(mockResponse))
    await expect(service.fetchVendorPaymentMethods('DAT', 'company1')).rejects.toThrow('Failed to fetch vendor payment methods')
  })

  it('should throw if httpService.get throws', async () => {
    configService.get.mockReturnValue('http://test')
    authService.getAccessToken.mockResolvedValue('token')
    httpService.get.mockReturnValue(throwError(() => new Error('Network error')))
    await expect(service.fetchVendorPaymentMethods('DAT', 'company1')).rejects.toThrow()
  })
})