import * as React from "react";

type ConfirmationEmailProps = {
  name: string;
  orderId: string;
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
};

export default function ConfirmationEmailTemplate({
  name,
  orderId,
  total,
  items,
}: ConfirmationEmailProps) {
  return (
    <div>
      <h1>Hi {name},</h1>
      <p>Thank you for your order. Your order ID is <strong>{orderId}</strong>.</p>

      <h3>Order Summary:</h3>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.name} x {item.quantity} = GH₵{(item.price * item.quantity).toFixed(2)}
          </li>
        ))}
      </ul>

      <p><strong>Total:</strong> GH₵{total.toFixed(2)}</p>
      <p>We’ll contact you shortly to confirm delivery details.</p>

      <p>Best regards,<br />Your Store Team</p>
    </div>
  );
}
