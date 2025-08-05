import { VendorBankAccountsService } from './vendor-bank-accounts.service'
import { HttpService } from '@nestjs/axios'
import { AuthService } from '../auth/auth.service'
import { ConfigService } from '@nestjs/config'
import { of, throwError } from 'rxjs'
import { AxiosResponse } from 'axios'


describe('VendorBankAccountsService', () => {
  let service: VendorBankAccountsService
  let httpService: Partial<Record<keyof HttpService, jest.Mock>>
  let authService: Partial<Record<keyof AuthService, jest.Mock>>
  let configService: Partial<Record<keyof ConfigService, jest.Mock>>
  let loggerErrorSpy: jest.SpyInstance

  beforeEach(() => {
    httpService = { get: jest.fn() }
    authService = { getAccessToken: jest.fn() }
    configService = { get: jest.fn() }
    service = new VendorBankAccountsService(
      httpService as any,
      authService as any,
      configService as any,
    )
    loggerErrorSpy = jest.spyOn(service['logger'], 'error').mockImplementation()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return data when all is successful', async () => {
    const mockBaseUrl = 'http://test'
    const mockToken = 'token'
    const mockData = { accounts: [] }
    const mockResponse: AxiosResponse = {
      data: mockData,
      status: 200,
      statusText: 'OK',
      headers: new (require('axios').AxiosHeaders)(),
      config: { headers: new (require('axios').AxiosHeaders)() },
    }
    configService.get!.mockReturnValue(mockBaseUrl)
    authService.getAccessToken!.mockResolvedValue(mockToken)
    httpService.get!.mockReturnValue(of(mockResponse))

    const result = await service.getVendorBankAccounts()
    expect(result).toBe(mockData)
    expect(configService.get).toHaveBeenCalledWith('base.url')
    expect(authService.getAccessToken).toHaveBeenCalled()
    expect(httpService.get).toHaveBeenCalledWith(
      `${mockBaseUrl}/VendorBankAccounts`,
      { headers: { Authorization: `Bearer ${mockToken}` } },
    )
  })

  // it('should throw if base URL is missing', async () => {
  //   configService.get!.mockReturnValue(undefined)
  //   await expect(service.getVendorBankAccounts()).rejects.toThrow('Base URL is not configured')
  // })

  it('should throw if response status is not 200', async () => {
    configService.get!.mockReturnValue('http://test')
    authService.getAccessToken!.mockResolvedValue('token')
    const mockResponse: AxiosResponse = {
      data: {},
      status: 500,
      statusText: 'Internal Server Error',
      headers: new (require('axios').AxiosHeaders)(),
      config: { headers: new (require('axios').AxiosHeaders)() },
    }
    httpService.get!.mockReturnValue(of(mockResponse))
    await expect(service.getVendorBankAccounts()).rejects.toThrow('Failed to fetch vendor bank accounts')
  })

  it('should log and throw on httpService error', async () => {
    configService.get!.mockReturnValue('http://test')
    authService.getAccessToken!.mockResolvedValue('token')
    httpService.get!.mockReturnValue(throwError(() => new Error('Network error')))
    await expect(service.getVendorBankAccounts()).rejects.toThrow('Failed to fetch vendor bank accounts')
    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Failed to fetch vendor bank accounts',
      expect.any(Error),
    )
  })
})