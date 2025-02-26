import nodemailer, { Transporter } from "nodemailer";
import serverSettings from "../../core/config/settings";

class ZohoMailer {
  private transporter: Transporter;
  private fromAddress: string;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.zeptomail.com",
      port: 465,
      secure: true,
      auth: {
        user: serverSettings.email.username,
        pass: serverSettings.email.password,
      },
    });
    this.fromAddress = "Identigo<noreply@identigo.africa>";
  }

  public async sendTextEmail(email: string, subject: string, text: string) {
    try {
      const mailOptions = {
        from: this.fromAddress,
        to: email,
        subject: subject,
        text: text,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
    }
  }

  public async sendHtmlEmail(email: string, subject: string, html: any) {
    try {
      const mailOptions = {
        from: this.fromAddress,
        to: email,
        subject: subject,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
    }
  }
}

export default ZohoMailer;
