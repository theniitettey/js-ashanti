import { Resend } from "resend";
import { VerificationEmailTemplate } from "../mail/verification-template";

export class EmailService {
  private static resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

  static async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      console.warn(
        `[EmailService] RESEND_API_KEY is not configured. Email to ${to} with subject "${subject}" was not sent.`
      );
      return;
    }

    await this.resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
    });
  }

  static async sendVerificationEmail(url: string, user: any) {
    const html = VerificationEmailTemplate({ url, name: user.name });
    await this.sendEmail(user.email, "Verify your email", html);
  }
}
