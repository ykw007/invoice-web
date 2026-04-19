import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login", "/register", "/view"];
const API_PUBLIC_PATHS = ["/api/auth/login", "/api/auth/register", "/api/view"];

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET ?? "";
  return new TextEncoder().encode(secret);
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

function isPublicApiPath(pathname: string): boolean {
  return API_PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  // TODO: Users DB 구성 완료 후 인증 활성화
  if (process.env.SKIP_AUTH === "true") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || isPublicApiPath(pathname)) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api/");
  const token =
    request.headers.get("Authorization")?.replace("Bearer ", "") ??
    request.cookies.get("token")?.value;

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, data: null, message: "인증이 필요합니다" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    if (isApiRoute) {
      return NextResponse.json(
        { success: false, data: null, message: "유효하지 않은 토큰입니다" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/settings/:path*",
    "/api/notion/:path*",
    "/api/auth/notion/:path*",
  ],
};
