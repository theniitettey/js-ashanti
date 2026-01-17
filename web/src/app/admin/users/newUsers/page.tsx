import { NewUserForm } from "@/components/admin/users/createUser";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AllUsersPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) return redirect("/login");

  const { success } = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: { Dashboard: ["update"] },
    },
  });
  if (!success) return redirect("/");

  return (
    <div className="container mx-auto px-4 py-8">
      <NewUserForm />
    </div>
  );
}