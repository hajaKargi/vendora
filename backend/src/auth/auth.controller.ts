import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  async getToken() {
    const accessToken = await this.authService.getAccessToken();
    return { access_token: accessToken };
  }
}
