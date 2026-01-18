"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";

// Define validation schema
const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be positive"),
  discount: z.number().min(0, "Discount must be positive"),
  ratingFromManufacturer: z.number().min(0).max(5, "Rating must be between 0-5").nullable()
  .optional(),
});

type ProductFormInputs = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    discount: number;
    ratingFromManufacturer?: number | null;
    slug: string;
  };
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInputs>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      discount: product.discount,
      ratingFromManufacturer: product.ratingFromManufacturer,
    },
  });

  const onSubmit: SubmitHandler<ProductFormInputs> = async (data) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'}/api/products/${product.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  useEffect(() => {
    reset({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      discount: product.discount,
      ratingFromManufacturer: product.ratingFromManufacturer,
    });
  }, [product, reset]);

  return (
    <div className="max-w-4xl p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label>Name</label>
          <Input
            {...register("name")}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label>Description</label>
          <Textarea
            {...register("description")}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label>Category</label>
          <Input
            {...register("category")}
            className={errors.category ? "border-red-500" : ""}
          />
          {errors.category && (
            <p className="text-red-500 text-sm">{errors.category.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label>Price</label>
          <Input
            type="number"
            step="0.01"
            {...register("price", { valueAsNumber: true })}
            className={errors.price ? "border-red-500" : ""}
          />
          {errors.price && (
            <p className="text-red-500 text-sm">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label>Discount</label>
          <Input
            type="number"
            step="0.01"
            {...register("discount", { valueAsNumber: true })}
            className={errors.discount ? "border-red-500" : ""}
          />
          {errors.discount && (
            <p className="text-red-500 text-sm">{errors.discount.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label>Rating (Manufacturer)</label>
          <Input
            type="number"
            step="0.1"
            {...register("ratingFromManufacturer", { valueAsNumber: true })}
            className={errors.ratingFromManufacturer ? "border-red-500" : ""}
          />
          {errors.ratingFromManufacturer && (
            <p className="text-red-500 text-sm">
              {errors.ratingFromManufacturer.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}