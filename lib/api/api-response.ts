import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, message }, { status });
}

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};
