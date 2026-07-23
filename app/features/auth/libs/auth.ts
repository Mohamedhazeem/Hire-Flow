import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../../../../lib/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { sendEmail } from "./email";
import { env } from "@/utils/env";
import ms from "ms";
import { Roles } from "../schema/role.schema";
import { headers } from "next/headers";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your password",
        url,
        type: "reset",
        userId: user.id,
      });
    },
    resetPasswordTokenExpiresIn: ms("5m") / 1000,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    expiresIn: ms("10m") / 1000,
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        url,
        type: "verification",
        userId: user.id,
      });
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Roles.USER,
        input: false,
        transform: {
          input: (value) => {
            if (typeof value === "string") {
              return value.toLowerCase();
            }
            return value;
          },
        },
      },
    },
  },
  updateUserOnSignIn: true,
  accountLinking: {
    enabled: true,
    trustedProviders: ["google", "facebook"],
  },
  socialProviders: {
    google: {
      clientId: env.data?.GOOGLE_CLIENT_ID as string,
      clientSecret: env.data?.GOOGLE_CLIENT_SECRET as string,
    },
  },

  rateLimit: {
    enabled: true, // Explicitly enable it (defaults to false in development mode)
    window: 60,
    max: 100,
    storage: "database",
    customRules: {
      "/sign-in/email": {
        window: 10,
        max: 5,
      },
      "/sign-up/email": {
        window: 60,
        max: 30,
      },
    },
  },

  plugins: [
    admin({
      adminRoles: ["admin", "super_admin"],
      roles: {
        super_admin: adminAc,
        admin: adminAc,
        user: userAc,
      },
    }),
    nextCookies(),
  ],
});

export async function getSession() {
  return await auth.api.getSession({ headers: await headers() });
}
