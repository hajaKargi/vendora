import { Injectable } from '@nestjs/common';
import { SmtpEmailService } from './smtp-email.service';
import { EmailOptions } from './email-options.interface';

/**
 * EmailNotificationService builds notification content and delegates sending to SmtpEmailService.
 */
@Injectable()
export class EmailNotificationService {
  constructor(private readonly smtpEmailService: SmtpEmailService) {}

  /**
   * Sends a welcome email to a vendor.
   * @param to Recipient email address
   * @param vendorName Vendor's name
   * @returns Promise<boolean> indicating success
   */
  async sendVendorWelcomeEmail(to: string, vendorName: string): Promise<boolean> {
    const options: EmailOptions = {
      to,
      subject: 'Welcome to Vendor Onboarding Platform',
      text: `Hello ${vendorName},\n\nYour vendor registration application was sent successfully!`,
      html: `<p>Hello <strong>${vendorName}</strong>,</p><p>Your vendor registration application was sent successfully!</p>`,
    };
    return this.smtpEmailService.sendEmail(options);
  }
}
