import { Resend } from "resend";
import { VerificationEmailTemplate } from "../mail/verification-template";

export class EmailService {
  private static resend = new Resend(process.env.RESEND_API_KEY);

  static async sendEmail(to: string, subject: string, html: string) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
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
