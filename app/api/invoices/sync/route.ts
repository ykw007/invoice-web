import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { verifyToken } from "@/lib/auth/jwt";
import { findIntegrationByUserId } from "@/lib/notion/db/integrations";
import { upsertInvoice } from "@/lib/notion/db/invoices";
import { getUserClient, getDataSourceId } from "@/lib/notion/client";
import { parseInvoicePage, parseItemPage } from "@/lib/notion/parser";
import { isFullPage } from "@notionhq/client";
import { NOTION_INVOICE_PROPS } from "@/types";
import type { InvoiceItem } from "@/types";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return fail("인증이 필요합니다", 401);

  const payload = await verifyToken(token);
  if (!payload) return fail("유효하지 않은 토큰입니다", 401);
  const { userId } = payload;

  const integration = await findIntegrationByUserId(userId);
  if (!integration) return fail("노션 연동이 필요합니다.", 400);
  if (!integration.invoiceDbId) return fail("Invoice DB가 설정되지 않았습니다.", 400);
  if (!integration.itemsDbId) return fail("Items DB가 설정되지 않았습니다.", 400);

  const notion = getUserClient(integration.accessToken);

  // Invoice DB 전체 페이지 페이지네이션 쿼리
  const invoiceDsId = await getDataSourceId(notion, integration.invoiceDbId);
  const invoicePages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const res = await notion.dataSources.query({
      data_source_id: invoiceDsId,
      start_cursor: cursor,
    });
    res.results.filter(isFullPage).forEach((p) => invoicePages.push(p));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  // Relation Item ID 수집 (중복 제거)
  const itemIdSet = new Set<string>();
  for (const page of invoicePages) {
    const itemsProp = page.properties[NOTION_INVOICE_PROPS.items];
    if (itemsProp?.type === "relation") {
      itemsProp.relation.forEach((r) => itemIdSet.add(r.id));
    }
  }

  // Item 페이지 병렬 조회 → Map<itemId, InvoiceItem>
  const itemEntries = await Promise.all(
    Array.from(itemIdSet).map(async (id) => {
      const page = await notion.pages.retrieve({ page_id: id });
      if (!isFullPage(page)) return null;
      const item = parseItemPage(page);
      if (!item) return null;
      return [id, item] as [string, InvoiceItem];
    })
  );

  const itemMap = new Map<string, InvoiceItem>(
    itemEntries.filter((e): e is [string, InvoiceItem] => e !== null)
  );

  // 각 Invoice 파싱 및 upsert
  let synced = 0;
  const errors: string[] = [];

  for (const page of invoicePages) {
    const itemsProp = page.properties[NOTION_INVOICE_PROPS.items];
    const pageItems: InvoiceItem[] =
      itemsProp?.type === "relation"
        ? itemsProp.relation
            .map((r) => itemMap.get(r.id))
            .filter((item): item is InvoiceItem => item !== undefined)
        : [];

    const result = parseInvoicePage(page, pageItems);

    if (result.ok) {
      await upsertInvoice({
        userId,
        notionPageId: result.notionPageId,
        data: result.data,
        status: result.status,
      });
      synced++;
    } else {
      errors.push(`${result.notionPageId}: ${result.error}`);
    }
  }

  return ok({ synced, errors });
}
