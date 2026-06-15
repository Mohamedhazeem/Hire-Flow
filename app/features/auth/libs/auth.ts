import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "../../../lib/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { Roles } from "../schema/role.schema";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Roles.USER,
      },
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
        max: 3,
      },
    },
  },

  plugins: [admin(), nextCookies()],
});
