"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cartStore";
import { FaShoppingCart } from "react-icons/fa";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export const CartIcon = ({ className }: Props) => {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <Link href="/cart" className={cn("relative", className)}>
      <FaShoppingCart className="text-xl" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
          {itemCount}
        </span>
      )}
    </Link>
  );
};
