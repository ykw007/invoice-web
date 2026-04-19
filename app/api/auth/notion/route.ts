import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api/response";
import { verifyToken, signToken } from "@/lib/auth/jwt";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return fail("인증이 필요합니다", 401);

  const payload = await verifyToken(token);
  if (!payload) return fail("유효하지 않은 토큰입니다", 401);

  const clientId = process.env.NOTION_CLIENT_ID;
  const redirectUri = process.env.NOTION_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return fail("Notion OAuth 환경변수가 설정되지 않았습니다.", 500);
  }

  // CSRF 방지용 state에 userId를 JWT로 인코딩
  const state = await signToken({ userId: payload.userId, email: payload.email });

  const url = new URL("https://api.notion.com/v1/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("owner", "user");
  url.searchParams.set("state", state);

  return NextResponse.redirect(url.toString());
}
