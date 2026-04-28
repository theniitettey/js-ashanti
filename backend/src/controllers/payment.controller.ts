import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { nanoid } from "nanoid";
import { trackSystemEvent } from "../websocket/ws";
import { EmailService } from "../services/email.service";
import { orderConfirmationTemplate } from "../mail/order-confirmation-template";

const SIMULATED_DELAY_MS = { min: 1500, max: 4000 };

function simulatePaymentOutcome(): { status: "SUCCESS" | "FAILED"; reason?: string } {
  const roll = Math.random();
  if (roll < 0.80) return { status: "SUCCESS" };
  if (roll < 0.90) return { status: "FAILED", reason: "Insufficient funds" };
  if (roll < 0.95) return { status: "FAILED", reason: "Card declined by issuer" };
  return { status: "FAILED", reason: "Network timeout with payment processor" };
}

function randomDelay(): number {
  return SIMULATED_DELAY_MS.min + Math.random() * (SIMULATED_DELAY_MS.max - SIMULATED_DELAY_MS.min);
}

export class PaymentController {

  static async initiatePayment(req: Request, res: Response) {
    try {
      const { orderId, amount, currency, customerEmail, customerName, metadata } = req.body;

      if (!orderId || !amount || !customerEmail) {
        return res.status(400).json({ error: "Missing required fields: orderId, amount, customerEmail" });
      }

      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (order.status !== "PENDING") {
        return res.status(409).json({ error: `Order is already ${order.status}` });
      }

      const paymentRef = `PAY-${nanoid(12)}`;

      const payment = await prisma.payment.create({
        data: {
          paymentRef,
          orderId,
          amount: Number(amount),
          currency: currency || "GHS",
          provider: "SIMULATION",
          status: "INITIATED",
          customerEmail,
          customerName: customerName || order.customerName,
          metadata: metadata || {},
        },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { paymentRef, paymentProvider: "SIMULATION" },
      });

      await trackSystemEvent({
        eventType: "PAYMENT_INITIATED",
        userId: customerEmail,
        sessionId: "payment",
        metadata: { paymentRef, orderId, amount, provider: "SIMULATION" },
      });

      // Simulate async processing
      setTimeout(async () => {
        try {
          await prisma.payment.update({
            where: { paymentRef },
            data: { status: "PROCESSING" },
          });

          await trackSystemEvent({
            eventType: "PAYMENT_PROCESSING",
            userId: customerEmail,
            sessionId: "payment",
            metadata: { paymentRef, orderId },
          });

          const outcome = simulatePaymentOutcome();
          const delay = randomDelay();

          setTimeout(async () => {
            try {
              if (outcome.status === "SUCCESS") {
                await prisma.$transaction([
                  prisma.payment.update({
                    where: { paymentRef },
                    data: { status: "SUCCESS", processedAt: new Date() },
                  }),
                  prisma.order.update({
                    where: { id: orderId },
                    data: { status: "PAID", paidAt: new Date() },
                  }),
                ]);

                await trackSystemEvent({
                  eventType: "PAYMENT_SUCCESS",
                  userId: customerEmail,
                  sessionId: "payment",
                  metadata: { paymentRef, orderId, amount },
                });

                await trackSystemEvent({
                  eventType: "ORDER_CONFIRMED",
                  userId: customerEmail,
                  sessionId: "payment",
                  metadata: { orderId, paymentRef },
                });

                try {
                  const fullOrder = await prisma.order.findUnique({ where: { id: orderId } });
                  if (fullOrder) {
                    const items = Array.isArray(fullOrder.items) ? fullOrder.items : [];
                    const emailHtml = orderConfirmationTemplate({
                      name: fullOrder.customerName,
                      orderId: fullOrder.id,
                      total: fullOrder.totalAmount,
                      items: (items as any[]).map((item: any) => ({
                        name: item.name, quantity: item.quantity, price: item.price,
                      })),
                    });
                    await EmailService.sendEmail(
                      fullOrder.email,
                      `Payment Confirmed – Order \${fullOrder.id}`,
                      emailHtml
                    );
                  }
                } catch (emailErr) {
                  console.error("[Payment] Email failed:", emailErr);
                }

              } else {
                await prisma.payment.update({
                  where: { paymentRef },
                  data: {
                    status: "FAILED",
                    failureReason: outcome.reason,
                    processedAt: new Date(),
                  },
                });

                await trackSystemEvent({
                  eventType: "PAYMENT_FAILED",
                  userId: customerEmail,
                  sessionId: "payment",
                  metadata: { paymentRef, orderId, reason: outcome.reason },
                });
              }
            } catch (err) {
              console.error("[Payment] Processing error:", err);
            }
          }, delay);
        } catch (err) {
          console.error("[Payment] Status update error:", err);
        }
      }, 500);

      return res.status(201).json({
        success: true,
        paymentRef,
        status: "INITIATED",
        message: "Payment is being processed. Poll /api/payments/:ref/status for updates.",
      });
    } catch (error) {
      console.error("[Payment] Initiation error:", error);
      return res.status(500).json({ error: "Failed to initiate payment" });
    }
  }

  static async getPaymentStatus(req: Request, res: Response) {
    try {
      const { ref } = req.params;
      const payment = await prisma.payment.findUnique({
        where: { paymentRef: ref },
        select: {
          paymentRef: true,
          orderId: true,
          amount: true,
          currency: true,
          provider: true,
          status: true,
          failureReason: true,
          processedAt: true,
          createdAt: true,
        },
      });

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      return res.json(payment);
    } catch (error) {
      console.error("[Payment] Status fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch payment status" });
    }
  }

  static async listPayments(req: Request, res: Response) {
    try {
      const session = (req as any).session;
      if (!session?.user?.id || session.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }

      const payments = await prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const stats = await prisma.payment.groupBy({
        by: ["status"],
        _count: true,
        _sum: { amount: true },
      });

      return res.json({ payments, stats });
    } catch (error) {
      console.error("[Payment] List error:", error);
      return res.status(500).json({ error: "Failed to list payments" });
    }
  }

  static async retryPayment(req: Request, res: Response) {
    try {
      const { ref } = req.params;
      const payment = await prisma.payment.findUnique({ where: { paymentRef: ref } });

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      if (payment.status !== "FAILED") {
        return res.status(409).json({ error: `Cannot retry payment in \${payment.status} status` });
      }

      const newRef = `PAY-\${nanoid(12)}`;

      const newPayment = await prisma.payment.create({
        data: {
          paymentRef: newRef,
          orderId: payment.orderId,
          amount: payment.amount,
          currency: payment.currency,
          provider: "SIMULATION",
          status: "INITIATED",
          customerEmail: payment.customerEmail,
          customerName: payment.customerName,
          metadata: { retryOf: ref },
        },
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentRef: newRef },
      });

      await trackSystemEvent({
        eventType: "PAYMENT_RETRY",
        userId: payment.customerEmail,
        sessionId: "payment",
        metadata: { oldRef: ref, newRef, orderId: payment.orderId },
      });

      // Trigger processing (reuse same flow)
      setTimeout(async () => {
        try {
          await prisma.payment.update({ where: { paymentRef: newRef }, data: { status: "PROCESSING" } });
          const outcome = simulatePaymentOutcome();
          setTimeout(async () => {
            try {
              if (outcome.status === "SUCCESS") {
                await prisma.$transaction([
                  prisma.payment.update({ where: { paymentRef: newRef }, data: { status: "SUCCESS", processedAt: new Date() } }),
                  prisma.order.update({ where: { id: payment.orderId }, data: { status: "PAID", paidAt: new Date() } }),
                ]);
                await trackSystemEvent({ eventType: "PAYMENT_SUCCESS", userId: payment.customerEmail, sessionId: "payment", metadata: { paymentRef: newRef, orderId: payment.orderId } });
              } else {
                await prisma.payment.update({ where: { paymentRef: newRef }, data: { status: "FAILED", failureReason: outcome.reason, processedAt: new Date() } });
                await trackSystemEvent({ eventType: "PAYMENT_FAILED", userId: payment.customerEmail, sessionId: "payment", metadata: { paymentRef: newRef, orderId: payment.orderId, reason: outcome.reason } });
              }
            } catch (e) { console.error("[Payment] Retry processing error:", e); }
          }, randomDelay());
        } catch (e) { console.error("[Payment] Retry update error:", e); }
      }, 500);

      return res.json({ success: true, paymentRef: newRef, status: "INITIATED" });
    } catch (error) {
      console.error("[Payment] Retry error:", error);
      return res.status(500).json({ error: "Failed to retry payment" });
    }
  }
}
