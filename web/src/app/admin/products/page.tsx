// app/admin/products/page.tsx (Server Component)
import { AdminProductsTable } from './productTable';
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminProducts() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return redirect("/sign-in");

  const { success } = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: { Dashboard: ["delete", "update"] },
    },
  });
  if (!success) return redirect("/dashboard");

  const cookieHeader = `cookie=${(await headers()).get("cookie") ?? ""}`;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
    method: "GET",
    headers: {
      Cookie: (await headers()).get("cookie") ?? "",
    },
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
