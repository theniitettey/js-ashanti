"use client";
import { useCartStore } from "@/lib/store/cartStore";

export default function CartDrawer() {
  const { items, removeItem, getTotalPrice, getDiscountedPrice } = useCartStore();

  const total = getTotalPrice();
  // const discountedTotal = getDiscountedPrice(10); // e.g. 10% off

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Cart</h2>
      {items.map((item) => (
        <div key={item.id} className="mb-2">
          <div className="flex justify-between">
            <span>{item.name} x {item.quantity}</span>
            <span>GH₵{item.price * item.quantity}</span>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="text-red-500 text-sm"
          >
            Remove
          </button>
        </div>
      ))}
      <hr className="my-4" />
      <p>Total: GH₵{total.toFixed(2)}</p>
      {/* <p>Discounted (10% off): GH₵{discountedTotal.toFixed(2)}</p> */}
    </div>
  );
}
