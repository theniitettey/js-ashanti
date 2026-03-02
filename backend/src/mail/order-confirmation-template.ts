export const orderConfirmationTemplate = ({
  name,
  orderId,
  total,
  items,
}: {
  name: string;
  orderId: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
}) => {
  const itemsHtml = items
    .map(
      (item) => `
    <li>
      ${item.name} x ${item.quantity} = GH₵${(item.price * item.quantity).toFixed(2)}
    </li>
  `
    )
    .join("");

  return `
    <div style="font-family: sans-serif; line-height: 1.5; color: #333;">
      <h1>Hi ${name},</h1>
      <p>Thank you for your order. Your order ID is <strong>${orderId}</strong>.</p>

      <h3>Order Summary:</h3>
      <ul>
        ${itemsHtml}
      </ul>

      <p><strong>Total:</strong> GH₵${total.toFixed(2)}</p>
      <p>We’ll contact you shortly to confirm delivery details.</p>

      <p>Best regards,<br />Your Store Team</p>
    </div>
  `;
};
