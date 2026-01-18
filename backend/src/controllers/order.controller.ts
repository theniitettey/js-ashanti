import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { EmailService } from '../services/email.service';
import { orderConfirmationTemplate } from '../mail/order-confirmation-template';

export class OrderController {
    static async checkout(req: Request, res: Response) {
        try {
            const body = req.body;
            const { fullName, email, phone, address, cartItems, total } = body;

            if (!fullName || !email || !phone || !address || !cartItems || !total) {
                return res.status(400).json({ error: "Missing required fields" });
            }

            const order = await prisma.order.create({
                data: {
                    customerName: fullName,
                    email,
                    phone,
                    address,
                    totalAmount: total,
                    items: cartItems,
                },
            });

            // Send confirmation email
            try {
                const emailHtml = orderConfirmationTemplate({
                    name: fullName,
                    orderId: order.id,
                    total,
                    items: cartItems.map((item: any) => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                });

                await EmailService.sendEmail(
                    email,
                    `Order Confirmation – ${order.id}`,
                    emailHtml
                );
            } catch (emailError) {
                console.error("Failed to send order confirmation email:", emailError);
                // We don't fail the request if email fails, but maybe log it
            }

            return res.json({ success: true, orderId: order.id });
        } catch (error) {
            console.error("Checkout failed:", error);
            return res.status(500).json({ error: "Failed to place order" });
        }
    }
}
