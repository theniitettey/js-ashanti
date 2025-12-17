//@ts-nocheck

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CustomerRatings } from "@/components/products/customerRating";
import { ProductDisplayCarousel } from "@/components/products/displayCarousel";
import { ColorPlatte } from "@/components/products/colorPlatte";
import {prisma} from "@/lib/prisma";
import { ProductCount } from "@/components/products/productCount";
import { ProductReviews } from "@/components/products/ProductReview";
import { PriceWithIcon } from "@/components/products/discoutProduct";
import { ProductsCardDetails } from "@/components/products/productsCard";
import { ProductDisplayCarouselSkeleton } from "@/components/products/skeletons/ProductDisplayCarouselSkeleton"

interface Params {
    params: Promise<{ slug: string }>;
  };
  
export async function generateMetadata(
    { params }: Params
  ): Promise<Metadata> {
    const { slug } = await params;

    const product = await prisma.product.findUnique({ where: { slug } });

    return {
      title: product?.name || "Product Not Found",
      description: product?.description || "This product does not exist.",
    };
  }

function getSimilarProducts(currentProduct: any, allProducts: any) {
    const { slug, category, subcategories, name, description } = currentProduct;
  
    const keywords = [...name.split(" "), ...description.split(" ")].map(word =>
      word.toLowerCase().replace(/[^\w]/g, "")
    );
  
    return allProducts
      .filter((item: any) => item.slug !== slug)
      .map((item: any) => {
        let score = 0;
        if (item.category === category) score += 3;
  
        if (item.subcategories && subcategories) {
          //@ts-ignore-next-line
          const match = item.subcategories.filter(sub => subcategories.includes(sub));
          score += match.length;
        }
  
        const itemKeywords = [...item.name.split(" "), ...item.description.split(" ")]
          .map(word => word.toLowerCase().replace(/[^\w]/g, ""));
        const keywordMatches = keywords.filter(word => itemKeywords.includes(word));
        score += keywordMatches.length * 0.5;
  
        return { ...item, score };
      })
      .sort((a:any, b:any) => b.score - a.score)
      .slice(0, 4);
}

export default async function ProductDetailPage({ params }: Params) {
    const { slug } = await params;

    const product = await prisma.product.findUnique({ where: { slug } });
    const allproducts = await prisma.product.findMany();
    
    if (!product) return notFound();

    const similarProducts = getSimilarProducts(product, allproducts);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 mt-24">
      <div className="grid md:grid-cols-2 gap-8"> 
        {product.images?.length > 0 ? (
          <ProductDisplayCarousel images={product.images} />
        ) : (
          <ProductDisplayCarouselSkeleton />
        )}

        <div className="mt-12 md:mt-0 flex flex-col justify-center">  
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="text-gray-700 dark:text-gray-300 mb-4">
          {
            product.discount ? (
              <div>
              <PriceWithIcon 
              className="text-blue-700 duration-800" 
              price={product.price} 
              discount={product.discount}
              iconClassName="w-4 h-4 md:w-6 md:h-6"
              priceClassName="text-2xl md:text-3xl lg:text-4xl" />
              </div>
            ) : (
              <PriceWithIcon 
              price={product.price} 
              className="text-blue-700"
              iconClassName="w-4 h-4 md:w-6 md:h-6"
              priceClassName="text-2xl md:text-3xl lg:text-4xl" />
            )
          }
          </div>
          <div className="flex gap-4 text-blue-500 mb-4">
            <CustomerRatings rating={product.ratingFromManufacturer} /> ({product.ratingFromManufacturer} Customers Reviews)
          </div>
          <p className="text-gray-600 mb-6 text-justify">{product.description}</p>
         
          <div className="items-center gap-2 mb-6">
              <h5 className="text-neutral-400 dark:text-neutral-300 text-md md:text-xl mb-2">Colors</h5>
              <div className="flex gap-2">
                <ColorPlatte colors={product.colors} />
              </div>
          </div>

          {/* Cart Button */}
          <div className="flex justify-between items-center">
             <ProductCount product={product}/>
          </div>
         {/* Reviews Section */}
        <div className="mt-10">
            <h2 className="text-xl font-semibold mb-2">Customer Reviews</h2>
            {/* Review Form */}
            <ProductReviews productSlug={slug} />
                
        </div>
           
        </div>
      </div>

     
      <div className="mt-48">
        {
            similarProducts.length > 0 && (
              <h2 className="text-center text-md md:text-xl font-bold">Similar Products</h2>
            )
          }
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {similarProducts.map((item: any) => (
            <ProductsCardDetails
            key={item.slug}
            id={item.id}  
            mainImage={item.images[0]}
            name={item.name} 
            price={item.price}
            description={item.description}
            slug={item.slug} />
          ))}
        </div>
        </div>
    </div>
  );
}
