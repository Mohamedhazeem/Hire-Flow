import { z } from "zod";

type ValidatorResult<T> =
  | { success: true; data: T }
  | { success: false; error: ReturnType<typeof z.flattenError> };

/**
 * Generic validator function that safely parses data with any Zod schema
 * @param schema - Any Zod schema
 * @param data - Data to validate
 * @returns Result object with either success + data or success: false + error
 */
export function validateWithZod<T>(schema: z.ZodSchema, data: unknown): ValidatorResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data as T };
  }

  return { success: false, error: z.flattenError(result.error) };
}
