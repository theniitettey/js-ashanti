"use client";

import { useState } from "react"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { productSchema, ProductFormData } from "@/lib/validations/productSchema";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
const categories = ["KITCHEN APPLIANCES", "COOKING WARES & SETS", "STORAGE & INSULATIONS", "HOME ESSENTIALS"];

export function AddProductForm() {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      category: "",
      subcategories: [],
      colors: [],
      price: 0,
      discount: 0,
      ratingFromManufacturer: 0,
      customerRating: 0,
      images: [],
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);  

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // Upload images to Cloudinary
      const uploadPromises = data.images.map(async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "ml_default");
        formData.append("folder", "products");
  
        const res = await fetch("https://api.cloudinary.com/v1_1/dbugzzv0v/image/upload", {
          method: "POST",
          body: formData,
        });
  
        const cloudData = await res.json();
        return cloudData.secure_url;
      });
  
      const uploadedImageUrls = await Promise.all(uploadPromises);
  
      // Now send product data with uploaded image URLs
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";
      const res = await fetch(`${backendUrl}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          images: uploadedImageUrls,
        }),
      });
  
      if (!res.ok) throw new Error("Failed to create product");

      toast.success("Product created successfully!");
      form.reset();
      form.setValue("category", "");
      form.setValue("subcategories", []);
     

      const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
      setIsSubmitting(false)
     } finally {
      setIsSubmitting(false);
     }
  };
  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl px-4 py-6">
        <h2 className="text-xl font-semibold">Add New Product</h2>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Product description..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subcategories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subcategories</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Smartphones, Tablets" 
                  value={field.value?.join(", ") ?? ""}
                  onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()))}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="colors"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Colors (comma separated)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Red, Blue, Black" 
                value={field.value?.join(", ") ?? ""}
                onChange={(e) => field.onChange(e.target.value.split(",").map(s => s.trim()))}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control} 
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount (%)</FormLabel>
                <FormControl>
                  <Input type="number" {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

          <FormField
            control={form.control}
            name="ratingFromManufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacturer Rating</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => form.setValue("images", Array.from(e.target.files || []))}
              />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>{
          isSubmitting && (<Loader2 className="animate-spin h-4 w-4 text-white" />)
          }{isSubmitting ? "Uploading ... " : "Add Product"}</Button>
      </form>
    </Form>
  );
}
