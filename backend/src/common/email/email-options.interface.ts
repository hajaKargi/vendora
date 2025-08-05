export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{ filename: string; path: string; contentType?: string }>;
}
