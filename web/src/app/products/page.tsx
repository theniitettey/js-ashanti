//@ts-nocheck
import type { Metadata } from "next"
import { ProductsClient } from "@/components/products/ProductsClient";
import { products as mockProducts } from "@/data/data";
import { prioritizeDiscountedProducts } from "@/lib/utils";

export const metadata: Metadata = {
  title: "J's Ashanti's Store Online - Products",
}

interface ProductsProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function Products({ searchParams: searchParamsPromise }: ProductsProps) {
  const searchParams = await searchParamsPromise;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001"}/api/products`,
    {
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch products")
  }

  let products = await res.json();

  // Fallback to mock data if DB is empty
  if (Array.isArray(products) && products.length === 0) {
    products = mockProducts;
  }

  if (Array.isArray(products)) {
    products = prioritizeDiscountedProducts(products);
  }

  return <ProductsClient products={products} searchParams={searchParams} />;
}
