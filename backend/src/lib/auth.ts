import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { customSession, bearer } from "better-auth/plugins";
import { admin as adminPlugin } from "better-auth/plugins";
import { ac, admin } from "./permissions";
import { EmailService } from "../services/email.service";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Must include any Origin the clients send. Web uses FRONTEND_URL; Expo injects
  // X-Expo-Origin (see server.ts) — typically http://localhost:8081 for Metro.
  trustedOrigins: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:8082",
    ...(process.env.BETTER_AUTH_ADDITIONAL_ORIGINS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) || []),
  ],
  emailVerification: {
    sendVerificationEmail: async ({ url, user }) => {
      try {
        await EmailService.sendVerificationEmail(url, user);
      } catch (error) {
        console.error("Failed to send verification email:", error);
        // Graceful failure: don't throw, allowing the user to at least exist in DB
      }
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 8,
    maxPasswordLength: 100,
    requireEmailVerification: false,
    // callbackUrl: '/', // Not needed for API-only backend typically, or set to frontend URL
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 24,
  },
  plugins: [
    customSession(async (session) => {
      const userWithRole = session.user as typeof session.user & {
        role: string;
      };

      return {
        ...session,
        user: {
          ...userWithRole,
          role: userWithRole.role ?? "user",
        },
      };
    }),
    adminPlugin({
      adminUserIds: [process.env.ADMIN_ID!],
      adminRoles: ["admin"],
      ac,
      roles: {
        admin,
      },
    }),
    bearer(),
  ],
  advanced: {
    cookies: {
      session_token: {
        name: "auth-cookies.session_token",
        attributes: {},
      },
    },
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
