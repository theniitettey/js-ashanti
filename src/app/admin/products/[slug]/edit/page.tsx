import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ProductForm } from './ProductForm';

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug: slug },
  });

  if (!product) notFound();

  return <ProductForm product={product} />;
}