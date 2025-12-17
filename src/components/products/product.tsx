import { Suspense } from "react";
import { ProductsList } from "./ProductsList";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { getRandomProducts } from "@/lib/utils";
export default async function Products() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return (
      <div className="max-w-7xl mx-auto md:px-4 py-10 mb-8 md:mb-24">
        <Suspense fallback={<SkeletonGrid />}>
          <SkeletonGrid />
        </Suspense>
      </div>
    );
  }

  const data = await res.json();
  const limitedProducts = getRandomProducts(data, 16);

  return (
    <div className="max-w-7xl mx-auto md:px-4 py-10 mb-8 md:mb-24">
      <Suspense fallback={<SkeletonGrid />}>
        <ProductsList products={limitedProducts} />
      </Suspense>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
}
