"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { HeroCard } from "./HeroCard";
import HeroSkeleton from "./HeroSkeleton";
import axios from "axios";

type Product = {
  id: string;
  name: string;
  description: string;
  images: string[];
  discount?: number;
  slug: string;
};

export function Hero() {
  const [displayProducts, setDisplayProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 7000, stopOnInteraction: false })
  );

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products");
        const allProducts: Product[] = res.data;

        const discounted = allProducts.filter(
          (p) => p.discount && p.discount > 0
        );

        if (discounted.length > 0) {
          setDisplayProducts(discounted);
        } else {
          const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
          setDisplayProducts(shuffled.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to load hero products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Carousel
      opts={{ align: "start" }}
      plugins={[autoplayPlugin.current]}
      className="w-full mt-24"
    >
      <CarouselContent>
        {loading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <CarouselItem key={idx} className="md:basis-full">
                <div className="p-1">
                  <HeroSkeleton />
                </div>
              </CarouselItem>
            ))
          : displayProducts.map((item) => (
              <CarouselItem key={item.id} className="md:basis-full">
                <HeroCard
                  id={item.id}
                  title={item.name}
                  description={item.description}
                  imageUrl={item.images[0]}
                  slug={item.slug}
                  discount={item.discount || 0}
                />
              </CarouselItem>
            ))}
      </CarouselContent>
    </Carousel>
  );
}
