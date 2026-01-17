import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from '@/lib/prisma'
import { nextCookies } from "better-auth/next-js";
import {
	customSession,
} from "better-auth/plugins";
import { sendEmail } from "@/email/send-email";
import { admin as adminPlugin } from "better-auth/plugins"
import { ac, admin } from "@/lib/permissions"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    emailVerification: {
      sendVerificationEmail: async ({ url, user }) => {
        await sendEmail(url, user);
      }
     },
    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
      minPasswordLength: 8,
      maxPasswordLength: 100,
      requireEmailVerification: false,
      callbackUrl: '/',    
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
          const userWithRole = session.user as typeof session.user & { role: string }
        
          return {
            ...session,
            user: {
              ...userWithRole,
              role: userWithRole.role ?? 'user',
            },
          };
        }),
        adminPlugin({
          adminUserIds: [process.env.ADMIN_ID!],
          adminRoles: ["admin", "superadmin"],
          ac,
          roles: {
              admin,
          },
          }),
        nextCookies(),
       ],
         /* trustedOrigins: [
        'http://localhost:3000',
    ], */     
    advanced: {
      cookies: {
        session_token: {
            name: "auth-cookies.session_token",
            attributes: {
               
            }
        },
    },
    useSecureCookies: true
  }
})
