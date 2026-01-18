import { AdminProductsTable } from './productTable';
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

export const dynamic = "force-dynamic";


export default async function AdminProducts() {
  const currentHeaders = await headers();
  const cookie = currentHeaders.get("cookie") ?? "";

  // Get session from backend
  const sessionRes = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
    headers: { cookie },
  });
  const session = await sessionRes.json();
  if (!session) return redirect("/sign-in");

  // Check permissions from backend
  const permissionRes = await fetch(`${BACKEND_URL}/api/auth/user-has-permission`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      cookie 
    },
    body: JSON.stringify({
      userId: session.user.id,
      permission: { Dashboard: ["delete", "update"] },
    }),
  });
  const { success } = await permissionRes.json();
  if (!success) return redirect("/dashboard");

  const res = await fetch(`${BACKEND_URL}/api/products`, {
    method: "GET",
    headers: { cookie },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  const products = await res.json();

  return (
    <div className="md:max-w-7xl px-4 py-10 mb-8 md:mb-24">
      <AdminProductsTable products={products} />
    </div>
  );
}
