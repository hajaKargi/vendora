import { IsString } from 'class-validator';

export class AuthRequestDto {
  @IsString()
  grant_type: string;

  @IsString()
  client_id: string;

  @IsString()
  client_secret: string;

  @IsString()
  resource: string;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}
