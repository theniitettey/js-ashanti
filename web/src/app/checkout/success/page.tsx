export default function CheckoutSuccess() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-green-600">Order Placed Successfully!</h1>
        <p className="mt-4 text-gray-600">Thank you for your order. We’ll reach out shortly to confirm your delivery.</p>
        <a
          href="/products"
          className="mt-6 inline-block bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700"
        >
          Continue Shopping
        </a>
      </div>
    );
  }
  