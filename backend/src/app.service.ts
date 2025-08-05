import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to the Vendor Onboarding Platform! Empowering seamless vendor registration and management.';
  }
}
