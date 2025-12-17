import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthRedirect() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) return redirect("/login");

  const { success } = await auth.api.userHasPermission({
    body: {
      userId: session.user.id,
      permissions: { Dashboard: ["create"] },
    },
  });

  if (success) {
    // Admin user
    return redirect("/admin");
  } else {
    // Standard user
    return redirect("/cart");
  }
}
