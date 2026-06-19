import { z } from "zod";

export const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_ENABLE_TEMP_CHECK: z.string().default("false"),

  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  BETTER_AUTH_SECRET: z.string(),
  DATABASE_URL: z.string(),

  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string(),
});

export type EnvTypes = z.infer<typeof envSchema>;

export const env = envSchema.safeParse(process.env);
