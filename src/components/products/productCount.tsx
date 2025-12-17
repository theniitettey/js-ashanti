"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cartStore";
import { FaPlus, FaMinus } from "react-icons/fa";
import { formatProductForCart } from "@/lib/formatProduct";

interface ProductCountProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    images?: { url: string }[];
    discount?: number;
  };
}

export function ProductCount({ product }: ProductCountProps) {
  const cartItem = useCartStore((state) =>
    state.items.find((item) => item.id === product.id)
  );

  const quantity = cartItem?.quantity || 0;

  const addToCart = () => {
    const formatted = formatProductForCart(product);
    useCartStore.getState().addItem(formatted);
  };

  return (
    <div className="flex flex-col gap-3 mt-3 w-full max-w-xs">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => useCartStore.getState().decreaseQuantity(product.id)}
          className="px-2 py-1 border rounded text-gray-700 hover:bg-gray-200"
        >
          <FaMinus />
        </button>

        <span className="px-2">{quantity}</span>

        <button
          type="button"
          onClick={() => {
            const formatted = formatProductForCart(product);
            useCartStore.getState().addItem(formatted);
          }}
          className="px-2 py-1 border rounded text-gray-700 hover:bg-gray-200"
        >
          <FaPlus />
        </button>
      </div>

      <Button
        onClick={addToCart}
        className="w-full text-white bg-blue-600 hover:bg-blue-700 transition-colors text-center rounded-md py-3"
      >
        Add to Cart
      </Button>
    </div>
  );
}
