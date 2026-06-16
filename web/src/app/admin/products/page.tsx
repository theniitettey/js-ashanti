import { AdminProductsTable } from './productTable';
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

export const dynamic = "force-dynamic";

function safeJsonParse<T>(raw: string): T | null {
  if (!raw || !raw.trim()) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default async function AdminProducts() {
  const currentHeaders = await headers();
  const cookie = currentHeaders.get("cookie") ?? "";

  const sessionRes = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
    headers: { cookie },
    cache: "no-store",
  });
  const sessionText = await sessionRes.text();
  const session = safeJsonParse<{ user?: { role?: string } }>(sessionText);
  if (!session?.user) return redirect("/login");
  if (session.user.role !== "admin") return redirect("/");

  const res = await fetch(`${BACKEND_URL}/api/products`, {
    method: "GET",
    headers: { cookie },
    cache: "no-store",
  });
  const productsText = await res.text();

  if (!res.ok) throw new Error("Failed to fetch products");
  const products = safeJsonParse<unknown[]>(productsText);
  if (!Array.isArray(products)) throw new Error("Invalid JSON from products API");

  return (
    <div className="md:max-w-7xl px-4 py-10 mb-8 md:mb-24">
      <AdminProductsTable products={products} />
    </div>
  );
}
