import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasPermission = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permission: {
        Dashboard: ["create"]
      }
    }
  });

  if (!hasPermission) {
    return NextResponse.json({ error: "Forbidden – You do not have permission to create products." }, { status: 403 });
  }

  const body = await req.json();

  // Bulk Upload Case: body is an array
  if (Array.isArray(body)) {
    const products = await prisma.product.createMany({
      data: body.map(product => ({
        name: product.name,
        slug: product.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
        description: product.description,
        category: product.category,
        subcategories: product.subcategories ?? [],
        colors: product.colors ?? [],
        price: product.price,
        discount: product.discount ?? 0,
        ratingFromManufacturer: product.ratingFromManufacturer ?? null,
        customerRating: product.customerRating ?? null,
        images: product.images ?? [],
      }))
    });

    return NextResponse.json({
      message: "Bulk upload successful",
      count: products.count
    }, { status: 201 });
  }

  // Single Upload Case: body is an object
  else if (typeof body === 'object' && body !== null) {
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
        description: body.description,
        category: body.category,
        subcategories: body.subcategories ?? [],
        colors: body.colors ?? [],
        price: body.price,
        discount: body.discount ?? 0,
        ratingFromManufacturer: body.ratingFromManufacturer ?? null,
        customerRating: body.customerRating ?? null,
        images: body.images ?? [],
      }
    });

    return NextResponse.json({
      message: 'Single product created successfully',
      product
    }, { status: 201 });
  }

  // Invalid body
  return NextResponse.json({
    error: 'Invalid request body format. Must be an object or array of objects.'
  }, { status: 400 });
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      // @ts-expect-error — cacheStrategy is from Accelerate
      cacheStrategy: { ttl: 60 } 
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const slug = searchParams.get('slug');

//   if (slug) {
//     const product = await prisma.product.findUnique({
//       where: { slug },
//     });

//     if (!product) {
//       return NextResponse.json({ message: 'Product not found' }, { status: 404 });
//     }

//     return NextResponse.json(product, { status: 200 });
//   }

//   const products = await prisma.product.findMany();

//   return NextResponse.json(products, { status: 200 });
// }

export async function DELETE(req: NextRequest) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasPermission = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permission: {
        Dashboard: ["delete"]
      }
    }
  });

  if (!hasPermission) {
    return NextResponse.json({ error: "Forbidden – You do not have permission to delete products." }, { status: 403 });
  }

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
  }

  const product = await prisma.product.delete({
    where: { id },
  });

  return NextResponse.json({
    message: 'Product deleted successfully',
    product,
  }, { status: 200 });
}