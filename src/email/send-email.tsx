import VerificationEmailTemplate from "@/mail/verification-template";
import { Resend } from "resend";

export const sendEmail = async (url: string, user: any) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Verify your email",
        react: VerificationEmailTemplate({ url, name: user.name})
    })
}
