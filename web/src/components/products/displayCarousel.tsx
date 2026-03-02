"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ProductDisplayProps {
  images: string[];
}

export function ProductDisplayCarousel({ images }: ProductDisplayProps) {
  const fallback = "/fallback-image.webp";
  const [currentImage, setCurrentImage] = useState(0);
  const [imageErrors, setImageErrors] = useState<string[]>([]);

  const handleImageChange = (index: number) => {
    setCurrentImage(index);
  };

  const handleImageError = (index: number) => {
    const newErrors = [...imageErrors];
    newErrors[index] = fallback;
    setImageErrors(newErrors);
  };

  const displayedImage = imageErrors[currentImage] || images[currentImage] || fallback;

  return (
    <main>
      {/* Main Image */}
      <div className="flex justify-center items-center">
        <Image
          src={displayedImage}
          alt={`Product Image ${currentImage + 1}`}
          width={600}
          height={600}
          className="rounded-2xl object-cover h-[300px] md:h-[500px] w-[600px] transition-all duration-300"
          onError={() => handleImageError(currentImage)}
        />
      </div>

      {/* Thumbnail Navigation */}
      <div className="grid grid-cols-4 justify-center mt-12 md:mt-24 gap-2">
        {images.map((image, index) => {
          const thumbnailSrc = imageErrors[index] || image;

          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={`mx-1${
                currentImage === index
              }`}
              onClick={() => handleImageChange(index)}
            >
              <Image
                src={thumbnailSrc}
                alt={`Thumbnail ${index + 1}`}
                width={100}
                height={100}
                className="rounded-lg h-24 w-48 md:h-48 md:w-48 object-cover" 
                onError={() => handleImageError(index)}
              />
            </Button>
          );
        })}
      </div>
    </main>
  );
}
