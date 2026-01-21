import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string(),
  description: z.string(),
  category: z.string(),
  subcategories: z.array(z.string()).min(1, "At least one subcategory is required"),
  colors: z.array(z.string()).min(1, "At least one color is required"),
  price: z.coerce.number().positive(),
  discount: z.coerce.number().min(0).max(100),
  ratingFromManufacturer: z.coerce.number().min(0).max(5),
  customerRating: z.coerce.number().min(0).max(5),
  stock: z.coerce.number().int().min(0),
  sku: z.string().optional(),
  images: z.array(z.instanceof(File)),
  
});

export type ProductFormData = z.infer<typeof productSchema>;
