import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getRandomProducts<T>(array: T[], count: number): T[] {
  return [...array].sort(() => Math.random() - 0.5).slice(0, count);
}

type DiscountableProduct = {
  discount?: number | null;
};

export function prioritizeDiscountedProducts<T extends DiscountableProduct>(
  products: T[]
): T[] {
  return [...products].sort(
    (a, b) => (Number(b.discount) || 0) - (Number(a.discount) || 0)
  );
}

export function pickFeaturedProducts<T extends DiscountableProduct>(
  products: T[],
  count: number
): T[] {
  const prioritized = prioritizeDiscountedProducts(products);
  const discounted = prioritized.filter((product) => (Number(product.discount) || 0) > 0);

  if (discounted.length >= count) {
    return discounted.slice(0, count);
  }

  const nonDiscounted = prioritized.filter((product) => (Number(product.discount) || 0) <= 0);
  return [...discounted, ...getRandomProducts(nonDiscounted, count - discounted.length)];
}
