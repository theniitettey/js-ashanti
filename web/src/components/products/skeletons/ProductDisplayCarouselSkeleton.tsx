"use client";
import { Skeleton } from "@/components/ui/skeleton"; 

export function ProductDisplayCarouselSkeleton() {
  return (
    <main>
      {/* Main Image Skeleton */}
      <div className="flex justify-center items-center">
        <Skeleton className="rounded-2xl h-[300px] md:h-[500px] w-[600px]" />
      </div>

      {/* Thumbnails Skeleton */}
      <div className="grid grid-cols-4 justify-center mt-12 md:mt-24 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className="rounded-lg h-24 w-48 md:h-48 md:w-48"
          />
        ))}
      </div>
    </main>
  );
}
