import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api/response";
import { verifyToken } from "@/lib/auth/jwt";
import { notionOAuthCallbackSchema } from "@/lib/schemas/notion.schema";
import { upsertIntegration } from "@/lib/notion/db/integrations";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const parsed = notionOAuthCallbackSchema.safeParse({
    code: searchParams.get("code"),
    state: searchParams.get("state") ?? undefined,
  });
  if (!parsed.success) {
    return fail("유효하지 않은 OAuth 콜백 파라미터입니다.", 400);
  }

  const { code, state } = parsed.data;

  // state JWT에서 userId 추출 (CSRF 검증)
  if (!state) return fail("state 파라미터가 누락되었습니다.", 400);
  const payload = await verifyToken(state);
  if (!payload) return fail("유효하지 않은 state 토큰입니다.", 400);

  const clientId = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;
  const redirectUri = process.env.NOTION_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return fail("Notion OAuth 환경변수가 설정되지 않았습니다.", 500);
  }

  // 인증 코드로 액세스 토큰 요청
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return fail("Notion 토큰 발급에 실패했습니다.", 500);
  }

  const tokenData = (await tokenRes.json()) as { access_token?: string };
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return fail("액세스 토큰을 받지 못했습니다.", 500);
  }

  await upsertIntegration(payload.userId, accessToken);

  return NextResponse.redirect(
    new URL("/settings/notion", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
  );
}
