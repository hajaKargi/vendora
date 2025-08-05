import { HttpService } from "@nestjs/axios"
import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { AxiosResponse } from "axios"
import { firstValueFrom } from "rxjs"
import { AuthService } from "../auth/auth.service"
import { VendorBankAccountResponseData } from "./interfaces/vendor-bank-account-response.interface"

@Injectable()
export class VendorBankAccountsService {
  private readonly logger = new Logger(VendorBankAccountsService.name)

  constructor(
    private readonly httpService: HttpService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async getVendorBankAccounts(): Promise<VendorBankAccountResponseData> {
    try {
      const baseUrl = this.configService.get<string>("base.url")
      if (!baseUrl) {
        throw new Error("Base URL is not configured")
      }

      const token = await this.authService.getAccessToken()
      const response: AxiosResponse<VendorBankAccountResponseData> = await firstValueFrom(
        this.httpService.get(`${baseUrl}/VendorBankAccounts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      )

      if (response.status !== 200) {
        throw new Error("Failed to fetch vendor bank accounts")
      }

      return response.data
    } catch (error) {
      this.logger.error("Failed to fetch vendor bank accounts", error)
      throw new Error("Failed to fetch vendor bank accounts")
    }
  }
}
