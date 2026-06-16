"use client";

import { useCartStore } from "@/lib/store/cartStore";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState, useCallback } from "react";
import { useAnalytics } from "@/hooks/use-analytics";

type ShippingForm = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
};

type PaymentState = {
  paymentRef: string;
  orderId: string;
  status: "INITIATED" | "PROCESSING" | "SUCCESS" | "FAILED";
  failureReason?: string;
};

export default function CheckoutPage() {
  const { items, getTotalPrice, getSubtotal, getDiscount, clearCart } = useCartStore();
  const { trackCheckout, trackEvent } = useAnalytics();
  const [mounted, setMounted] = useState(false);
  const [payment, setPayment] = useState<PaymentState | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const safeItems = mounted ? items : [];
  const subtotal = mounted ? (getSubtotal ? getSubtotal() : getTotalPrice()) : 0;
  const discount = mounted && getDiscount ? getDiscount() : 0;
  const total = mounted ? getTotalPrice() : 0;
  const shipping = 0;
  const tax = 0;
  const finalTotal = total + shipping + tax;

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingForm>();

  const pollPaymentStatus = useCallback(async (ref: string, orderId: string) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";
    let attempts = 0;
    const maxAttempts = 20;

    const poll = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/payments/${ref}/status`);
        const data = res.data;
        setPayment({ paymentRef: ref, orderId, status: data.status, failureReason: data.failureReason });

        if (data.status === "SUCCESS") {
          trackEvent("payment_success", { paymentRef: ref, orderId });
          toast.success("Payment successful!");
          clearCart();
          setTimeout(() => router.push("/checkout/success"), 1500);
          return;
        }

        if (data.status === "FAILED") {
          trackEvent("payment_failed", { paymentRef: ref, orderId, reason: data.failureReason });
          toast.error(`Payment failed: ${data.failureReason || "Unknown error"}`);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1500);
        }
      } catch {
        attempts++;
        if (attempts < maxAttempts) setTimeout(poll, 2000);
      }
    };

    poll();
  }, [trackEvent, clearCart, router]);

  const handleRetry = async () => {
    if (!payment) return;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";
    try {
      setPayment(prev => prev ? { ...prev, status: "INITIATED" } : null);
      const res = await axios.post(`${backendUrl}/api/payments/${payment.paymentRef}/retry`);
      const newRef = res.data.paymentRef;
      setPayment({ paymentRef: newRef, orderId: payment.orderId, status: "INITIATED" });
      toast("Retrying payment...");
      pollPaymentStatus(newRef, payment.orderId);
    } catch {
      toast.error("Failed to retry payment");
    }
  };

  const onSubmit = async (data: ShippingForm) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";
      trackCheckout("start", finalTotal);

      const response = await axios.post(
        `${backendUrl}/api/orders/checkout`,
        { ...data, cartItems: safeItems, total: finalTotal },
        { withCredentials: true }
      );

      trackCheckout("complete", finalTotal);

      const { orderId, paymentRef } = response.data;
      setPayment({ paymentRef, orderId, status: "INITIATED" });
      toast("Processing payment...");

      pollPaymentStatus(paymentRef, orderId);
    } catch (err) {
      console.error(err);
      trackEvent("checkout_failed", { itemCount: safeItems.length, total: finalTotal });
      const apiError = axios.isAxiosError(err)
        ? (err.response?.data as { error?: string } | undefined)?.error
        : undefined;
      toast.error(apiError ?? "Failed to place order");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "INITIATED": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "PROCESSING": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "SUCCESS": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "FAILED": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
      {payment ? (
        <div className="md:col-span-2 max-w-lg mx-auto w-full">
          <div className="rounded-xl border p-8 shadow-sm space-y-6">
            <div className="text-center">
              {payment.status === "INITIATED" && (
                <div className="animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                  <h2 className="text-xl font-semibold">Initiating Payment...</h2>
                </div>
              )}
              {payment.status === "PROCESSING" && (
                <div className="animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">⏳</span>
                  </div>
                  <h2 className="text-xl font-semibold">Processing Payment...</h2>
                  <p className="text-muted-foreground mt-2">Please wait while we verify your payment</p>
                </div>
              )}
              {payment.status === "SUCCESS" && (
                <div>
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h2 className="text-xl font-semibold text-green-700 dark:text-green-400">Payment Successful!</h2>
                  <p className="text-muted-foreground mt-2">Redirecting to confirmation...</p>
                </div>
              )}
              {payment.status === "FAILED" && (
                <div>
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">❌</span>
                  </div>
                  <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">Payment Failed</h2>
                  <p className="text-muted-foreground mt-2">{payment.failureReason || "An error occurred"}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                  >
                    Retry Payment
                  </button>
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Reference</span>
                <span className="font-mono text-xs">{payment.paymentRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-xs">{payment.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">GH\u20B5{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h2 className="text-2xl font-semibold">Shipping Information</h2>
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input {...register("fullName", { required: true })} className="w-full border p-2 rounded mt-1" />
              {errors.fullName && <p className="text-red-500 text-sm">Name is required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input {...register("email", { required: true })} type="email" className="w-full border p-2 rounded mt-1" />
              {errors.email && <p className="text-red-500 text-sm">Email is required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Phone Number</label>
              <input {...register("phone", { required: true })} className="w-full border p-2 rounded mt-1" />
              {errors.phone && <p className="text-red-500 text-sm">Phone number is required</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Address</label>
              <textarea {...register("address", { required: true })} className="w-full border p-2 rounded mt-1" />
              {errors.address && <p className="text-red-500 text-sm">Address is required</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !mounted || safeItems.length === 0}
              className="w-full bg-indigo-600 text-white py-3 rounded-full hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : `Pay GH\u20B5${finalTotal.toFixed(2)}`}
            </button>
            <p className="text-xs text-center text-muted-foreground">Secure payment simulation</p>
          </form>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-gray-100 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            <ul className="divide-y">
              {safeItems.map((item) => (
                <li key={item.id} className="py-3 flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span>GH\u20B5{(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t pt-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>GH\u20B5{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount (10%)</span>
                  <span>-GH\u20B5{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2">
                <span>Total</span>
                <span>GH\u20B5{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
