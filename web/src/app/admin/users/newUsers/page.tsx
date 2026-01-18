import { NewUserForm } from "@/components/admin/users/createUser";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001";

export const dynamic = "force-dynamic";


export default async function NewUsersPage() {
  const currentHeaders = await headers();
  const cookie = currentHeaders.get("cookie") ?? "";

  // Get session from backend
  const sessionRes = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
    headers: { cookie },
  });
  const session = await sessionRes.json();
  if (!session) return redirect("/login");

  // Check permissions from backend
  const permissionRes = await fetch(`${BACKEND_URL}/api/auth/user-has-permission`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      cookie 
    },
    body: JSON.stringify({
      userId: session.user.id,
      permission: { Dashboard: ["update"] },
    }),
  });
  const { success } = await permissionRes.json();
  if (!success) return redirect("/");

  return (
    <div className="container mx-auto px-4 py-8">
      <NewUserForm />
    </div>
  );
}