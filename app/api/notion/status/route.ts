import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { verifyToken } from "@/lib/auth/jwt";
import { findIntegrationByUserId } from "@/lib/notion/db/integrations";
import type { NotionStatusDTO } from "@/types";

export async function GET(request: NextRequest) {
  // SKIP_AUTH 모드: JWT 없이 환경변수 기반으로 상태 반환
  if (process.env.SKIP_AUTH === "true") {
    const dbId = process.env.NOTION_INVOICES_DB_ID ?? null;
    const dto: NotionStatusDTO = {
      status: dbId ? "connected" : "disconnected",
      databaseId: dbId,
      itemsDatabaseId: process.env.NOTION_ITEMS_DB_ID ?? null,
      connectedAt: null,
    };
    return ok(dto);
  }

  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return fail("인증이 필요합니다", 401);

  const payload = await verifyToken(token);
  if (!payload) return fail("유효하지 않은 토큰입니다", 401);

  const integration = await findIntegrationByUserId(payload.userId);

  if (!integration) {
    const dto: NotionStatusDTO = {
      status: "disconnected",
      databaseId: null,
      itemsDatabaseId: null,
      connectedAt: null,
    };
    return ok(dto);
  }

  const dto: NotionStatusDTO = {
    status: integration.status,
    databaseId: integration.invoiceDbId,
    itemsDatabaseId: integration.itemsDbId,
    connectedAt: integration.connectedAt,
  };
  return ok(dto);
}
