"use client";

export default function ErrorPage() {
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Product Not Found</h1>
            <p className="text-lg text-gray-700 mb-6 text-center">
                The product you are looking for does not exist or has been removed.
            </p>
            <a
                href="/products"
                className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition"
            >
                Go back to Products
            </a>
        </div>
    );
}