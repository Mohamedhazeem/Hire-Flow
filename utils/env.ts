import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string(),

  NEXT_PUBLIC_APP_URL: z.url(),
  NODE_ENV: z.enum(["development", "production"]).default("development"),

  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),

  NEXT_PUBLIC_ENABLE_TEMP_MAIL_CHECK: z.enum(["true", "false"]).default("false"),
  ALLOW_SEED: z.enum(["true", "false"]).default("false"),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string(),

  PUSHER_APP_ID: z.string(),
  PUSHER_KEY: z.string(),
  PUSHER_SECRET: z.string(),
  PUSHER_CLUSTER: z.string(),
  NEXT_PUBLIC_PUSHER_KEY: z.string(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string(),
});

export type EnvTypes = z.infer<typeof envSchema>;

export const env = envSchema.safeParse(process.env);
