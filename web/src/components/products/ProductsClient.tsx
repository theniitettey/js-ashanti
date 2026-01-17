"use client";

import { useState, useEffect } from "react";
import {
  ProductsCardDetails,
  ProductsCardHeader,
} from "@/components/products/productsCard";
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MotionEffect } from '@/components/animate-ui/effects/motion-effect';
import { ProductCardSkeleton } from './ProductCardSkeleton'

const headerInfo = {
  name: "Store.",
  description: "The best way to buy the products you love.",
};

export function ProductsClient({ products, searchParams }: { products: any[]; searchParams: { [key: string]: string } }) {
  const [selectedTab, setSelectedTab] = useState("all-Products");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash && (hash === "all-Products" || Object.keys(categoryMap).includes(hash))) {
        setSelectedTab(hash);
      }
    }
  }, []);

  const { page = "1", per_page = "12" } = searchParams;
  const currentPage = parseInt(page, 10);
  const itemsPerPage = parseInt(per_page, 10);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedProduct = products.slice(startIndex, endIndex);

  const categoryMap: Record<string, string> = {
    "kitchen-appliances": "KITCHEN APPLIANCES",
    "cooking-ware": "COOKING WARES & SETS",
    "insulations": "STORAGE & INSULATIONS",
    "home-essentials": "HOME ESSENTIALS",
  };

  function getProductsByCategory(products: any[], tabKey: string, start: number, end: number) {
    const categoryName = categoryMap[tabKey];
    if (!categoryName) return [];
    return products
      .filter((product) => product.category?.toUpperCase() === categoryName)
      .slice(start, end);
  }

  if (paginatedProduct.length === 0) {
    return (
      <div className="md:max-w-7xl mx-auto px-4 py-10 mb-8 md:mb-24">
        <ProductsCardHeader
          name={headerInfo.name}
          description={headerInfo.description}
          classNames={"mb-4"}
        />
        <p className="text-center text-gray-500">No products found.</p>
      </div>
    );
  }


  return (
    <div className="md:max-w-7xl mx-auto px-2 md:px-4 py-10 mb-8 md:mb-24">
      <ProductsCardHeader
        name={headerInfo.name}
        description={headerInfo.description}
        classNames={"mb-4 px-4"}
      />

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full flex-col justify-start gap-6">
          <Select value={selectedTab} onValueChange={setSelectedTab}>
          <SelectTrigger
                  className="flex lg:hidden"
                  size="sm"
                  id="view-selector"
                >
              <SelectValue placeholder="Select a view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-Products">All Products</SelectItem>
              <SelectItem value="kitchen-appliances">Kitchen Appliances</SelectItem>
              <SelectItem value="cooking-ware">Cookware</SelectItem>
              <SelectItem value="insulations">Insulation & Food Storage</SelectItem>
              <SelectItem value="home-essentials">Home Essentials</SelectItem>
            </SelectContent>
          </Select>

          <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-2 hidden lg:flex gap-3 text-sm font-medium">
            <TabsTrigger value="all-Products">All Products</TabsTrigger>
            <TabsTrigger value="kitchen-appliances">Kitchen Appliances</TabsTrigger>
            <TabsTrigger value="cooking-ware">Cookware</TabsTrigger>
            <TabsTrigger value="insulations">Insulation & Food Storage</TabsTrigger>
            <TabsTrigger value="home-essentials">Home Essentials</TabsTrigger>
          </TabsList>

        {/* All Products */}
        <TabsContent value="all-Products">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
          {isLoading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <ProductCardSkeleton key={idx} />
                ))
              : paginatedProduct.map((product, index) => (
                    <ProductsCardDetails
                      {...product}
                      mainImage={product.images[0]}
                      rating={product.ratingFromManufacturer}
                    />
                ))}
          </div>
          <div className="mt-12">
            <PaginationWithLinks page={currentPage} pageSize={itemsPerPage} totalCount={products.length} />
          </div>
        </TabsContent>

        {/* Category Tabs */}
        {Object.keys(categoryMap).map((category) => {
          const filtered = getProductsByCategory(products, category, startIndex, endIndex);
          return (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
              {isLoading
                  ? Array.from({ length: 8 }).map((_, idx) => (
                      <ProductCardSkeleton key={idx} />
                    ))
                  : filtered.map((product, index) => (
                        <ProductsCardDetails
                          {...product}
                          mainImage={product.images[0]}
                          rating={product.ratingFromManufacturer}
                        />
                    ))}
              </div>
              <div className="mt-12">
                <PaginationWithLinks
                  page={currentPage}
                  pageSize={itemsPerPage}
                  totalCount={products.filter(
                    (p) => p.category?.toUpperCase() === categoryMap[category]
                  ).length}
                />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
