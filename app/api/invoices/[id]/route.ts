import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { verifyToken } from "@/lib/auth/jwt";
import { findInvoiceById } from "@/lib/notion/db/invoices";
import { getMasterClient } from "@/lib/notion/client";
import { isFullPage } from "@notionhq/client";
import { parseInvoicePage, parseItemPage } from "@/lib/notion/parser";
import { NOTION_INVOICE_PROPS } from "@/types";
import type { Invoice, InvoiceData, InvoiceItem } from "@/types";

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return request.cookies.get("token")?.value ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // SKIP_AUTH 모드: Notion 페이지 직접 조회 및 파싱
  if (process.env.SKIP_AUTH === "true") {
    const notion = getMasterClient();
    const page = await notion.pages.retrieve({ page_id: id });
    if (!isFullPage(page)) return fail("견적서를 찾을 수 없습니다.", 404);

    // Relation에서 Items 페이지 ID 수집
    const itemsProp = page.properties[NOTION_INVOICE_PROPS.items];
    const itemIds: string[] =
      itemsProp?.type === "relation" ? itemsProp.relation.map((r) => r.id) : [];

    // Items 병렬 조회 및 파싱
    const items: InvoiceItem[] = (
      await Promise.all(
        itemIds.map(async (itemId) => {
          const p = await notion.pages.retrieve({ page_id: itemId });
          return isFullPage(p) ? parseItemPage(p) : null;
        })
      )
    ).filter((item): item is InvoiceItem => item !== null);

    const result = parseInvoicePage(page, items);
    if (!result.ok) return fail(result.error, 400);

    const invoice: Invoice = {
      id: page.id,
      userId: "skip-auth",
      notionPageId: page.id,
      shareToken: null,
      data: result.data,
      status: result.status,
      createdAt: page.created_time,
      updatedAt: page.last_edited_time,
    };
    return ok(invoice);
  }

  const token = extractToken(request);
  if (!token) return fail("인증이 필요합니다", 401);

  const payload = await verifyToken(token);
  if (!payload) return fail("유효하지 않은 토큰입니다", 401);
  const { userId } = payload;

  const row = await findInvoiceById(id);

  if (!row) return fail("견적서를 찾을 수 없습니다.", 404);
  if (row.userId !== userId) return fail("접근 권한이 없습니다.", 403);

  const data: InvoiceData = JSON.parse(row.dataJson);
  const invoice: Invoice = {
    id: row.pageId,
    userId: row.userId,
    notionPageId: row.notionPageId,
    shareToken: row.shareToken,
    data,
    status: row.status,
    createdAt: row.updatedAt,
    updatedAt: row.updatedAt,
  };

  return ok(invoice);
}
