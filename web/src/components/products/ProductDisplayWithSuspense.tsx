"use client";

import { Suspense } from "react";
import { ProductDisplayCarousel } from "./displayCarousel";
import { ProductDisplayCarouselSkeleton } from "./skeletons/ProductDisplayCarouselSkeleton";

export function ProductDisplayWithSuspense({ images }: { images: string[] }) {
  return (
    <Suspense fallback={<ProductDisplayCarouselSkeleton />}>
      <ProductDisplayCarousel images={images} />
    </Suspense>
  );
}