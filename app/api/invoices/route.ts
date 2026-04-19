import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { verifyToken } from "@/lib/auth/jwt";
import { listInvoicesByUserId } from "@/lib/notion/db/invoices";
import { getMasterClient, getDataSourceId } from "@/lib/notion/client";
import { isFullPage } from "@notionhq/client";
import { parseItemPage } from "@/lib/notion/parser";
import type { InvoiceListItem, InvoiceData, InvoiceItem } from "@/types";
import { NOTION_INVOICE_PROPS, NOTION_STATUS_MAP } from "@/types";

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return request.cookies.get("token")?.value ?? null;
}

export async function GET(request: NextRequest) {
  // SKIP_AUTH 모드: NOTION_INVOICES_DB_ID를 직접 쿼리
  if (process.env.SKIP_AUTH === "true") {
    const dbId = process.env.NOTION_INVOICES_DB_ID;
    if (!dbId) return ok([] as InvoiceListItem[]);

    const notion = getMasterClient();
    const dsId = await getDataSourceId(notion, dbId);
    const rows: InvoiceListItem[] = [];
    let cursor: string | undefined;

    do {
      const res = await notion.dataSources.query({ data_source_id: dsId, start_cursor: cursor });
      for (const page of res.results) {
        if (!isFullPage(page)) continue;
        const p = page.properties;

        const numProp = p[NOTION_INVOICE_PROPS.invoiceNumber];
        const invoiceNumber = numProp?.type === "title" ? (numProp.title[0]?.plain_text ?? "") : "";

        const nameProp = p[NOTION_INVOICE_PROPS.clientName];
        const clientName = nameProp?.type === "rich_text" ? (nameProp.rich_text[0]?.plain_text ?? "") : "";

        const itemsProp = p[NOTION_INVOICE_PROPS.items];
        const itemIds = itemsProp?.type === "relation"
          ? itemsProp.relation.map((r) => r.id)
          : [];
        const fetchedItems = await Promise.all(
          itemIds.map(async (itemId) => {
            const ip = await notion.pages.retrieve({ page_id: itemId });
            return isFullPage(ip) ? parseItemPage(ip) : null;
          })
        );
        const items = fetchedItems.filter((i): i is InvoiceItem => i !== null);
        const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

        const statusProp = p[NOTION_INVOICE_PROPS.status];
        const selectName = statusProp?.type === "select" ? (statusProp.select?.name ?? "") : "";
        const status = NOTION_STATUS_MAP[selectName] ?? "draft";

        const dateProp = p[NOTION_INVOICE_PROPS.issuedAt];
        const issuedAt = dateProp?.type === "date" ? (dateProp.date?.start ?? "") : "";

        rows.push({ id: page.id, invoiceNumber, clientName, totalAmount, status, issuedAt, hasShareLink: false });
      }
      cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
    } while (cursor);

    return ok(rows);
  }

  const token = extractToken(request);
  if (!token) return ok([] as InvoiceListItem[]);

  const payload = await verifyToken(token);
  if (!payload) return fail("유효하지 않은 토큰입니다", 401);
  const { userId } = payload;

  const rows = await listInvoicesByUserId(userId);

  const list: InvoiceListItem[] = rows.map((row) => {
    const data: InvoiceData = JSON.parse(row.dataJson);
    return {
      id: row.pageId,
      invoiceNumber: data.invoiceNumber,
      clientName: data.clientName,
      totalAmount: data.totalAmount,
      status: row.status,
      issuedAt: data.issuedAt,
      hasShareLink: !!row.shareToken,
    };
  });

  return ok(list);
}
