export function formatProductForCart(product: {
  id: string;
  name: string;
  price: number;
  discount?: number;
  image?: string;
  images?: { url: string }[];
}) {
  const hasDiscount = product.discount && product.discount > 0;
  const finalPrice = hasDiscount
    ? product.price - (product.price * product.discount!) / 100
    : product.price;

  return {
    id: product.id,
    name: product.name,
    price: finalPrice,
    image: product.image || product.images?.[0]?.url || "/fallback-image.webp",
    quantity: 1,
    discount: product.discount,
  };
}