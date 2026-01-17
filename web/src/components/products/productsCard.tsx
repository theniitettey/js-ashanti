"use client"

import Image from "next/image";
import { ProductCardProps, ProductCardCategoriesProps } from "@/interface/types";
import { CustomerRatings } from "./customerRating";
import { Button } from "../ui/button";
import { FaAngleDown, FaCartPlus  } from "react-icons/fa";
import Link from 'next/link';
import { useState } from 'react';
import { useCartStore } from "@/lib/store/cartStore";
import { formatProductForCart } from "@/lib/formatProduct";
import { toast } from "react-hot-toast";
import { PriceWithIcon } from "@/components/products/discoutProduct"


// Header Component
export const ProductsCardHeader = ({
  name,
  description,
  classNames,
}: Pick<ProductCardProps, "name" | "description" | "classNames">) => (
  <div className={`${classNames} pt-20 flex justify-between font-bold items-start`}>
    <>
      <h2 className="text-md md:text-3xl font-semibold mb-2 gap-1 w-96">{name} 
      <span className="text-gray-600 text-xl md:text-3xl">{description}</span>
      </h2>
    </>
    
    <div className="flex items-center gap-2 mt-2">
      <Button asChild>
        <span>
          Filter <span><FaAngleDown /></span>
        </span>
      </Button>
    </div>
  </div>
);

// Category Badge Component
export const ProductCardCategories = ({
  categories = [],
  imageUrl,
  classNames,
}: ProductCardCategoriesProps) => (
  <div className={`mt-12 p-8 flex flex-col items-center gap-2 ${classNames}`}>
    {imageUrl && (
      <Image
        src={imageUrl}
        alt="Category Image"
        width={100}
        height={100}
        className="w-24 h-24 rounded-2xl object-cover"
      />
    )}
    {categories.map((category, index) => (
      <span
        key={index}
        className="text-xs lg:text-2xl font-medium"
      >
        {category}
      </span>
    ))}
  </div>
);

// Product Card Component
export const ProductsCardDetails = ({
  id,
  mainImage ,
  slug,
  name,
  description,
  rating,
  reviewCount,
  price,
  discount = 0,
  badgeColor = "bg-red-500",
}: ProductCardProps) => {
  const [ImgSrc, setImgSrc] = useState<string>(mainImage as string);

  const addToCart = () => {
    const product = {
        id,
        name,
        price,
        discount,
        image: mainImage,
      };
    
    const formatted = formatProductForCart(product);
    useCartStore.getState().addItem(formatted);
    toast.success(`${name} added to cart`);
  };

  return (
  <div className="flex flex-col rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border overflow-hidden h-full">
    {/* Image with badge */}
    <div className="relative">
      <Image
        src={ImgSrc || "/fallback-image.webp"}
        alt={name}
        width={600}
        height={400}
        onError={() => setImgSrc("/fallback-image.webp")}
        className="w-full h-32 lg:h-52 object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
        loading="lazy"
      />
      {discount > 0 && (
        <span
          className={`absolute top-2 right-2 text-xs font-semibold text-white px-2 py-1 rounded-2xl animate-pulse duration-300 ${badgeColor}`}
        >
           {discount}% OFF
        </span>
      )}
    </div>

    {/* Content */}
    <div className="flex flex-col flex-grow p-4">
      {/* Rating */}
        {
          //@ts-ignore-next-line
        rating > 0 && (
        <div className="flex justify-between items-center gap-1 text-yellow-500 text-sm mb-1">
          <CustomerRatings rating={rating} />
          <div className="flex items-center gap-1">
            <span>{rating}</span>
            <span className="text-gray-500 hidden lg:block">({reviewCount} reviews)</span>
          </div>
        </div>  
        )
        }

      {/* Title & Description */}
      <h2 className="text-lg font-semibold">{name}</h2>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
    </div>
    
      {/* Pricing */}
      <div className="flex items-center justify-between gap-2 mb-4 px-4 py-1">
        <div className="flex justify-between items-center gap-4">
          {
            discount ? (
              <div>
              {/* <PriceWithIcon price={price} className="text-gray-400 line-through" /> */}
              <PriceWithIcon className="text-blue-700 duration-800" price={price} discount={discount} />
              </div>
            ) : (
              <PriceWithIcon price={price} className="text-blue-700" />
            )
          }
        </div>
        <Link href={`/products/${slug}`}>
        <Button className="p-4 text-xs md:text-md font-bold hidden lg:flex">View Product</Button>
        </Link>
      </div>

      {/* CTA Button on Desktop */}
      <Button
        onClick={addToCart}
        className="w-full text-white bg-blue-600 hover:bg-blue-700 transition-colors mt-auto text-center rounded-md p-4 hidden lg:flex"
      >
        Add to Cart
      </Button>

      {/* Mobile View */}
      <div className="flex justify-between items-center lg:hidden px-2 py-1">
        <Link href={`/products/${slug}`}>
          <Button aria-label="Product Details" className="p-4 text-xs md:text-md font-bold">View Product</Button>
          </Link>

          <Button
        size="icon"
        onClick={addToCart}
        className="text-white bg-blue-600 hover:bg-blue-700 transition-colors mt-auto text-center rounded-md md:p-4 lg:hidden"
        aria-label="Add to cart"
      >
        <FaCartPlus />
      </Button>
      </div>

      
  </div>
)};
