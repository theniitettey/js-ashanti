import { NewUserForm } from "@/components/admin/users/createUser";
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

export default async function NewUsersPage() {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <NewUserForm />
    </div>
  );
}