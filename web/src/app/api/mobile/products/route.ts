import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/mobile/products
 * Mobile endpoint to fetch products with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");

    const whereClause: any = {};
    if (category && category !== "all") {
      whereClause.category = category;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        take: limit,
        skip,
        select: {
          id: true,
          slug: true,
          name: true,
          price: true,
          discount: true,
          category: true,
          description: true,
          images: true,
          customerRating: true,
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      products,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[Mobile Products] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/mobile/products
 * Create a new product from mobile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      price,
      discount,
      colors,
      subcategories,
      images,
    } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || "",
        category,
        price,
        discount: discount || 0,
        colors: colors || [],
        subcategories: subcategories || [],
        images: images || [],
        customerRating: null,
        ratingFromManufacturer: null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[Mobile Create Product] Error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
