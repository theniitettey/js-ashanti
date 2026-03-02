import { Resend } from "resend";
import ConfirmationEmailTemplate from "@/mail/confirmation-template";

type SendConfirmationEmailProps = {
  to: string;
  name: string;
  orderId: string;
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
};

export const sendConfirmationEmail = async ({
  to,
  name,
  orderId,
  total,
  items,
}: SendConfirmationEmailProps) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: `Order Confirmation – ${orderId}`,
    react: ConfirmationEmailTemplate({ name, orderId, total, items }),
  });
};
