import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class SendGridEmailService {
  private readonly logger = new Logger(SendGridEmailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  }

  async sendVendorWelcomeEmail(to: string, vendorName: string) {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
      subject: 'Welcome to Vendor Onboarding Platform',
      text: `Hello ${vendorName},\n\nYour vendor registration application was sent successful!`,
      html: `<p>Hello <strong>${vendorName}</strong>,</p><p>Your vendor registration application was sent successful!</p>`,
    };
    try {
      await sgMail.send(msg);
      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
    }
  }
}
