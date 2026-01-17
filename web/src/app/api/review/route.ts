import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { customerName, review, productSlug, rating } = body;

  if (!customerName || !review || !productSlug || typeof rating !== "number") {
    return NextResponse.json({ message: "Missing or invalid fields" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ message: "Rating must be between 1 and 5" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const newReview = await prisma.review.create({
      data: {
        name: customerName,
        text: review,
        rating: rating,
        productSlug: product.slug,
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Error creating review" }, { status: 500 });
  }
}
