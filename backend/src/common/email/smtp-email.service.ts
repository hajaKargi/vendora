import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailOptions } from './email-options.interface';

/**
 * SmtpEmailService handles SMTP logic, error handling, and monitoring.
 */
@Injectable()
export class SmtpEmailService {
  private readonly logger = new Logger(SmtpEmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  /**
   * Sends an email using SMTP with type-safe options.
   * Integrates monitoring/alerting for failed sends.
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.SMTP_FROM_EMAIL || 'noreply@yourdomain.com',
      ...options,
    };
    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${options.to} | Subject: ${options.subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to} | Subject: ${options.subject}`);
      this.logger.error(`Error details: ${error?.message || error}`);
      this.notifyMonitoringService(error, options);
      return false;
    }
  }

  /**
   * Integrate with monitoring/alerting for failed email sends.
   * Replace with your preferred monitoring solution (e.g., Sentry, Datadog, custom logger).
   */
  private notifyMonitoringService(error: any, options: EmailOptions): void {
    this.logger.warn(`Monitoring alert: Email send failure for ${options.to} | Subject: ${options.subject}`);
    // e.g., Sentry.captureException(error), Datadog API call, etc.
  }
}
