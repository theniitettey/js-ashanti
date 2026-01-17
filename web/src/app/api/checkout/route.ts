import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendConfirmationEmail } from "@/email/sendConfirmationEmail";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { fullName, email, phone, address, cartItems, total } = body;

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

  await sendConfirmationEmail({
    to: email,
    name: fullName,
    orderId: order.id,
    total,
    items: cartItems.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
  });

  return NextResponse.json({ success: true });
}
