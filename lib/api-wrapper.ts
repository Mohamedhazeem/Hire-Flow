import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api-response";
import { ApiError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError, ConflictError } from "./api-error";
import { logger } from "@/utils/logger";
import z, { ZodError } from "zod";

const ERROR_STATUS_MAP: Record<string, number> = {
  [UnauthorizedError.name]: 401,
  [ForbiddenError.name]: 403,
  [NotFoundError.name]: 404,
  [ValidationError.name]: 400,
  [ConflictError.name]: 409,
  [ApiError.name]: 0, // dynamic — use error.status
};

type RouteContext<TParams extends Record<string, string> = Record<string, string>> = {
  params: Promise<TParams>;
};

type SimpleHandler = (request: NextRequest) => Promise<NextResponse>;
type ParamHandler<TParams extends Record<string, string> = Record<string, string>> = (
  request: NextRequest,
  context: RouteContext<TParams>,
) => Promise<NextResponse>;

function handleError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const validationDetails = z.flattenError(error).fieldErrors;
    return NextResponse.json(
      {
        error: "Validation failed",
        details: validationDetails,
      },
      { status: 422 },
    );
  }
  if (error instanceof Error) {
    if (error.name in ERROR_STATUS_MAP) {
      if (error instanceof ApiError) {
        return fail(error.message, error.status);
      }
      return fail(error.message, ERROR_STATUS_MAP[error.name]);
    }
  }
  logger.server.error("Unhandled API Error:", error);
  return fail("Internal server error", 500);
}

export function withErrorHandler(
  handler: SimpleHandler,
): (request: NextRequest) => Promise<NextResponse>;

export function withErrorHandler<TParams extends Record<string, string>>(
  handler: ParamHandler<TParams>,
): (request: NextRequest, context: RouteContext<TParams>) => Promise<NextResponse>;

export function withErrorHandler<TParams extends Record<string, string>>(
  handler: SimpleHandler | ParamHandler<TParams>,
) {
  return async (request: NextRequest, context?: RouteContext<TParams>): Promise<NextResponse> => {
    try {
      if (context) {
        return await (handler as ParamHandler<TParams>)(request, context);
      }
      return await (handler as SimpleHandler)(request);
    } catch (error: unknown) {
      return handleError(error);
    }
  };
}
