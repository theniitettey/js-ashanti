//@ts-nocheck
import type { Metadata } from "next"
import { ProductsClient } from "@/components/products/ProductsClient";

export const metadata: Metadata = {
     title: "J's Ashanti's Store Online - Products",
}    

interface ProductsProps {
  searchParams: Promise<{[key: string]: string | undefined }>;
}

export default async function Products({ searchParams: searchParamsPromise }: ProductsProps) {
  const searchParams = await searchParamsPromise;

  const res = await fetch(
    `${process.env.BASE_URL || "http://localhost:3000"}/api/products`,
    {
      next: { revalidate: 60 }, // ISR: revalidate every 60s
    }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch products")
  }

  const products = await res.json();

  return <ProductsClient products={products} searchParams={searchParams} />;
}
