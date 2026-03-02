"use client";

import { useCartStore } from "@/lib/store/cartStore";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

type ShippingForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
};

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const subtotal = getTotalPrice();
  const shipping = 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingForm>();

  const onSubmit = async (data: ShippingForm) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";
      await axios.post(`${backendUrl}/api/orders/checkout`, {
        ...data,
        cartItems: items,
        total,
      });

      clearCart();
      router.push("/checkout/success");
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
      {/* Shipping Info Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-semibold">Shipping Information</h2>

        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input
            {...register("fullName", { required: true })}
            className="w-full border p-2 rounded mt-1"
          />
          {errors.fullName && <p className="text-red-500 text-sm">Name is required</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            {...register("email", { required: true })}
            type="email"
            className="w-full border p-2 rounded mt-1"
          />
          {errors.email && <p className="text-red-500 text-sm">Email is required</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Phone Number</label>
          <input
            {...register("phone", { required: true })}
            className="w-full border p-2 rounded mt-1"
          />
          {errors.phone && <p className="text-red-500 text-sm">Phone number is required</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Address</label>
          <textarea
            {...register("address", { required: true })}
            className="w-full border p-2 rounded mt-1"
          />
          {errors.address && <p className="text-red-500 text-sm">Address is required</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-3 rounded-full hover:bg-indigo-700"
        >
          {isSubmitting ? "Placing Order..." : "Place Order"}
        </button>
      </form>

      {/* Order Summary */}
      <div className="rounded-lg bg-gray-50 dark:text-black p-6 shadow-sm">
        <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.id} className="py-3 flex justify-between">
              <span>{item.name} × {item.quantity}</span>
              <span>GH₵{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t pt-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>GH₵{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>GH₵{shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>GH₵{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2">
            <span>Total</span>
            <span>GH₵{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
