"use client";

import { useState, useEffect } from "react";
import { ProductsCardDetails } from "./productsCard";
import { TiArrowRight } from "react-icons/ti";
import { motion, useInView } from "framer-motion";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { getRandomProducts } from "@/lib/utils";

export function ProductsList({ products: initialProducts }: { products: any[] }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [isLoading, setIsLoading] = useState(!initialProducts?.length);

  useEffect(() => {
    if (!initialProducts?.length) {
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          setProducts(getRandomProducts(data, 16));
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [initialProducts]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg lg:text-2xl font-bold">Featured Products</h1>
        <a href="/products" className="flex text-[12px] text-blue-600 hover:underline gap-2">
          View All Products
          <span>
            <TiArrowRight className="text-2xl animate-pulse transition" />
          </span>
        </a>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.8, bounce: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, idx) => <ProductCardSkeleton key={idx} />)
          : products.map((product, index) => (
              <ProductsCardDetails
                key={index}
                {...product}
                mainImage={product.images?.[0]}
                rating={product.ratingFromManufacturer}
              />
            ))}
      </motion.div>
    </>
  );
}
