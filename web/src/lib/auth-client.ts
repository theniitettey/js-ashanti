import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { ac, admin } from "@/lib/permissions";

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
      },
    }),
  ],
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4001",
});

export const googlesignIn = async () => {
  const data = await authClient.signIn.social({
    provider: "google",
    callbackURL: "/auth-redirect", // landing route after sign-in
    errorCallbackURL: "/login?error=1",
  });
};
export const { signIn, signUp, signOut, useSession } = createAuthClient();

export type Session = typeof authClient.$Infer.Session.user;
