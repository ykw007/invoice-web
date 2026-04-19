import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { verifyToken } from "@/lib/auth/jwt";
import { notionDatabaseSettingSchema } from "@/lib/schemas/notion.schema";
import { updateDatabaseIds, deleteIntegration } from "@/lib/notion/db/integrations";

async function extractUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}

export async function POST(request: NextRequest) {
  const userId = await extractUserId(request);
  if (!userId) return fail("인증이 필요합니다", 401);

  const body: unknown = await request.json();
  const result = notionDatabaseSettingSchema.safeParse(body);
  if (!result.success) {
    return fail(result.error.errors[0]?.message ?? "입력값이 올바르지 않습니다.", 400);
  }

  const { databaseId, itemsDatabaseId } = result.data;

  await updateDatabaseIds(userId, databaseId, itemsDatabaseId);
  return ok({ message: "데이터베이스 ID가 등록되었습니다." });
}

export async function DELETE(request: NextRequest) {
  const userId = await extractUserId(request);
  if (!userId) return fail("인증이 필요합니다", 401);

  await deleteIntegration(userId);
  return ok({});
}
