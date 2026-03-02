"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AiOutlineDelete } from "react-icons/ai";
import { FiEdit3 } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export function AdminProductsTable({ products }: { products: any[] }) {
    const router = useRouter();
    const deleteProduct = async (productId: string) => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";
        const res = await fetch(`${backendUrl}/api/products`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: productId }),
        });

        if (!res.ok) throw new Error("Failed to delete");

        toast.success("Product deleted");
        router.refresh();
      } catch (err) {
        toast.error("Failed to delete product");
        console.error(err);
      }
    };
    const editProduct = async (slug: string) => {
      router.push(`/admin/products/${slug}/edit`)
    }

  return (
    <div className="md:max-w-7xl px-4 py-10 mb-8 md:mb-24">
      <h1 className="text-2xl font-bold mb-4">Admin Products Page</h1>
      <p className="text-gray-500">Manage your products here.</p>

      <div className="mt-8">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow >
              <TableHead>S/N</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-10">
            {products.map((product: any, index: number) => (
              <TableRow key={product.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="h-20">{product.name}</TableCell>
                <TableCell className="h-20 ">{product.category}</TableCell>
                <TableCell className="h-20 ">GH₵ {product.price.toFixed(2)}</TableCell>
                <TableCell className="flex items-center mx-auto h-20 gap-2">
                  <button
                  onClick={() => editProduct(product.slug)}
                  className="text-blue-500 hover:text-blue-700">
                    <FiEdit3 size={20} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => deleteProduct(product.id)}
                  >
                    <AiOutlineDelete size={20} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
    </div>
  );
}
