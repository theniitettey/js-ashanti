"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { toast } from "react-hot-toast";
import axios from "axios";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  discount?: number;
};

export default function DiscountCampaign() {
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<{ [productId: string]: number }>({});
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products");
        setProducts(res.data);
        const initialDiscounts = Object.fromEntries(
          res.data.map((p: Product) => [p.id, p.discount ?? 0])
        );
        setDiscounts(initialDiscounts);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  const handleDiscountChange = (productId: string, value: number) => {
    setDiscounts((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleDiscountSubmit = async (slug: string, productId: string) => {
    try {
      setLoadingSlug(slug);
      const discount = discounts[productId];

      if (discount < 0 || discount > 100) {
        toast.error("Discount must be between 0 and 100");
        return;
      }

      await axios.patch(`/api/products/discount/${slug}`, { discount });
      toast.success("Discount updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update discount");
    } finally {
      setLoadingSlug(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>S/N</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product, idx) => (
          <TableRow key={product.id}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell>{product.price}</TableCell>
            <TableCell>
              <input
                type="number"
                className="border p-1 w-20 rounded"
                value={discounts[product.id] ?? 0}
                min={0}
                max={100}
                onChange={(e) =>
                  handleDiscountChange(product.id, Number(e.target.value))
                }
              />
            </TableCell>
            <TableCell>
              <button
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() => handleDiscountSubmit(product.slug, product.id)}
                disabled={loadingSlug === product.slug}
              >
                {loadingSlug === product.slug ? "Updating..." : "Apply"}
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
