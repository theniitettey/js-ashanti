"use client";

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Loader2, Star } from "lucide-react";
import clsx from 'clsx';
import { toast } from 'react-hot-toast';

type Inputs = {
  customerName: string;
  review: string;
  rating: number;
};

type Review = {
  id: string;
  name: string;
  text: string;
  rating: number;
  createdAt: string;
};

export function ProductReviews({ productSlug }: { productSlug: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Inputs>();

  const fetchReviews = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";
      const res = await fetch(`${backendUrl}/api/reviews/${productSlug}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productSlug]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";
      const res = await fetch(`${backendUrl}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: data.customerName,
          review: data.review,
          rating: selectedRating,
          productSlug: productSlug,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      fetchReviews();
      reset();
      setSelectedRating(0);
      setShowForm(false);
      toast.success("Review submitted!");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={clsx("w-4 h-4 inline", {
        "text-yellow-500 fill-yellow-500": i < count,
        "text-gray-300": i >= count,
      })} />
    ));

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Rating Summary (static for now) */}
      <div className="flex flex-col-reverse gap-6 mb-8">
        <div>
          <div className="mt-4">
            <p className="text-md font-medium">Share your thoughts</p>
            <p className="text-md text-muted-foreground mb-2">If you've used this product, share your thoughts with other customers</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 border rounded hover:bg-gray-100 text-md"
            >
              Write a review
            </button>
          </div>
        </div>

        {/* Reviews */}
        <div className="md:col-span-2 space-y-6 ">
          {isLoading ? (
            <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-b pb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center animate-pulse gap-4">
                <div className="flex flex-col space-y-1 mb-2 w-full">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-full">
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-4 w-4 rounded-full bg-gray-200"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          ) : reviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 flex flex-col lg:flex-row justify-between items-start gap-4 ">
                <div className="flex flex-col space-y-1 mb-2">
                  <span className="font-semibold">{review.name}</span>
                  <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-200 lg:max-w-[300px] lg:text-start">{review.text}</p>
                <div>{renderStars(review.rating)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="border-t pt-6 space-y-4">
          <div>
            <label className="block text-md font-medium mb-1">Your Name</label>
            <input
              type="text"
              disabled={isSubmitting}
              placeholder="Full Name"
              className="w-full border p-2 rounded"
              {...register("customerName", {
                required: "Enter your full name",
              })}
            />
            {errors.customerName && <p className="text-sm text-red-500">{errors.customerName.message}</p>}
          </div>

          <div>
            <label className="block text-md font-medium mb-1">Your Review</label>
            <textarea
              placeholder="Write your review..."
              disabled={isSubmitting}
              className="w-full border p-2 rounded"
              {...register("review", {
                required: "Type a review",
                minLength: {
                  value: 8,
                  message: "Review must be at least 8 characters",
                },
              })}
            />
            {errors.review && <p className="text-sm text-red-500">{errors.review.message}</p>}
          </div>

          <div className='flex justify-between'>
            <label className="block text-md font-medium mb-1">Rating</label>
            <div className="flex space-x-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSelectedRating(i + 1);
                    setValue("rating", i + 1); // update react-hook-form value
                  }}
                  className="focus:outline-none"
                >
                  <Star
                    className={clsx("w-6 h-6", {
                      "text-yellow-500 fill-yellow-500": i < selectedRating,
                      "text-gray-300": i >= selectedRating,
                    })}
                  />
                </button>
              ))}
            </div>
            
          </div>
          {selectedRating === 0 && (
              <p className="text-sm text-red-500">Please select a rating</p>
            )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {isSubmitting && <Loader2 className="animate-spin h-5 w-5 inline mr-2" />}
            {isSubmitting ? "Submitting" : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
}
