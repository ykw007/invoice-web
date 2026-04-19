import { NextResponse } from "next/server";
import type { ApiResponse, ApiErrorResponse } from "@/types";

export function ok<T>(
  data: T,
  status = 200,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function fail(
  message: string,
  status = 400
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ success: false, data: null, message }, { status });
}
