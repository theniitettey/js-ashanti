"use client";


import { useState, useEffect } from "react";
import { FaRegStar , FaStar , FaStarHalfAlt  } from "react-icons/fa";
import { ProductCardProps } from "@/interface/types";

type RatingProps = Pick<ProductCardProps, "rating">;
export const CustomerRatings = ({ rating }: RatingProps) => {
  const [userRating, setUserRating] = useState(rating || 0);

  // Optional: if you want the prop to update state when it changes
  useEffect(() => {
    setUserRating(rating || 0);
  }, [rating]);

  const handleRatingChange = (newRating: number) => {
    setUserRating(newRating);
    // Here you could send the rating to backend or state manager if needed
  };

  const renderStars = (ratingValue: number) => {
    const fullStars = Math.floor(ratingValue);
    const halfStar = ratingValue % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <FaStar key={`full-${i}`} className="text-blue-700 text-md lg:text-xl" />
        ))}
        {halfStar === 1 && (
          <FaStarHalfAlt  className="text-blue-700 text-md lg:text-xl" />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-blue-700 text-md lg:text-xl" />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      {/* Star Display */}
      <div className="flex items-center gap-1">
        {renderStars(userRating)}
      </div>
    </div>
  );
};
