import { z } from "zod";
import { SignInSchema, SignUpSchema } from "./auth.schema";

export type RegisterInputType = z.infer<typeof SignUpSchema>;
export type LoginInputType = z.infer<typeof SignInSchema>;
export type ActionResult =
  | { success: true }
  | { success: false; errors?: Record<string, string[] | undefined> };

export type AuthType = "LOGIN" | "SIGNUP";

export type AuthRedirectTargetType = "/user" | "/admin" | "/recruiter" | "/";

export type UserCredentials = {
  token: string;
} & { user: User };

export type SessionCredentials = { session: Session } & User;

export type Session = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
  impersonatedBy?: string | null | undefined;
};
// 1. Remove the nested 'user' key so it reflects a single user object
export type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null;
  role: string; // Use your strict RoleType here instead of string!
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
};
