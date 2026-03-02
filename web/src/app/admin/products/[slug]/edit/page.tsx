import { notFound } from 'next/navigation';
// import { prisma } from '@/lib/prisma'; // Removed Prisma
import { ProductForm } from './ProductForm';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

async function getProduct(slug: string) {
  const res = await fetch(`${BACKEND_URL}/api/products/${slug}`, {
    cache: 'no-store' // Don't cache admin edit page data
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return <ProductForm product={product} />;
}