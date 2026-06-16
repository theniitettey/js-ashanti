"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cartStore";
import { FaShoppingCart } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Props {
  className?: string;
}

export const CartIcon = ({ className, noLink }: Props & { noLink?: boolean }) => {
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const Content = () => (
    <>
      <FaShoppingCart className="text-xl" />
      {mounted && itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
          {itemCount}
        </span>
      )}
    </>
  );

  if (noLink) {
    return (
      <div className={cn("relative", className)}>
        <Content />
      </div>
    );
  }

  return (
    <Link href="/cart" className={cn("relative", className)}>
      <Content />
    </Link>
  );
};
