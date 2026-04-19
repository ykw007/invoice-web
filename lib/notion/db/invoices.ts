import { getMasterClient, getDataSourceId } from "@/lib/notion/client";
import type { NotionInvoiceRow, InvoiceStatus, InvoiceData } from "@/types";
import { NOTION_SYS_INVOICE_PROPS } from "@/types";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { isFullPage } from "@notionhq/client";

const dbId = () => {
  const id = process.env.NOTION_INVOICES_DB_ID;
  if (!id) throw new Error("환경변수 NOTION_INVOICES_DB_ID가 설정되지 않았습니다.");
  return id;
};

const VALID_STATUSES: InvoiceStatus[] = ["draft", "sent", "accepted", "rejected"];

function rowFromPage(page: PageObjectResponse): NotionInvoiceRow {
  const p = page.properties;

  const userIdProp = p[NOTION_SYS_INVOICE_PROPS.userId];
  const userId =
    userIdProp?.type === "rich_text"
      ? (userIdProp.rich_text[0]?.plain_text ?? "")
      : "";

  const pageIdProp = p[NOTION_SYS_INVOICE_PROPS.notionPageId];
  const notionPageId =
    pageIdProp?.type === "rich_text"
      ? (pageIdProp.rich_text[0]?.plain_text ?? "")
      : "";

  const dataProp = p[NOTION_SYS_INVOICE_PROPS.dataJson];
  const dataJson =
    dataProp?.type === "rich_text"
      ? (dataProp.rich_text[0]?.plain_text ?? "{}")
      : "{}";

  const statusProp = p[NOTION_SYS_INVOICE_PROPS.status];
  const rawStatus =
    statusProp?.type === "select" ? (statusProp.select?.name ?? "") : "";
  const status: InvoiceStatus = (VALID_STATUSES as string[]).includes(rawStatus)
    ? (rawStatus as InvoiceStatus)
    : "draft";

  const tokenProp = p[NOTION_SYS_INVOICE_PROPS.shareToken];
  const shareToken =
    tokenProp?.type === "rich_text"
      ? (tokenProp.rich_text[0]?.plain_text || null)
      : null;

  const updatedAtProp = p[NOTION_SYS_INVOICE_PROPS.updatedAt];
  const updatedAt =
    updatedAtProp?.type === "date"
      ? (updatedAtProp.date?.start ?? "")
      : "";

  return { pageId: page.id, userId, notionPageId, dataJson, status, shareToken, updatedAt };
}

/** userId로 견적서 목록 조회 */
export async function listInvoicesByUserId(userId: string): Promise<NotionInvoiceRow[]> {
  const notion = getMasterClient();
  const dsId = await getDataSourceId(notion, dbId());
  const rows: NotionInvoiceRow[] = [];
  let cursor: string | undefined;

  do {
    const res = await notion.dataSources.query({
      data_source_id: dsId,
      start_cursor: cursor,
      filter: {
        property: NOTION_SYS_INVOICE_PROPS.userId,
        rich_text: { equals: userId },
      },
    });
    res.results.filter(isFullPage).forEach((p) => rows.push(rowFromPage(p)));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return rows;
}

/** 페이지 ID로 단건 조회 */
export async function findInvoiceById(pageId: string): Promise<NotionInvoiceRow | null> {
  const notion = getMasterClient();
  const page = await notion.pages.retrieve({ page_id: pageId });
  return isFullPage(page) ? rowFromPage(page) : null;
}

/** shareToken으로 공개 조회 */
export async function findInvoiceByShareToken(token: string): Promise<NotionInvoiceRow | null> {
  const notion = getMasterClient();
  const dsId = await getDataSourceId(notion, dbId());
  const res = await notion.dataSources.query({
    data_source_id: dsId,
    filter: {
      property: NOTION_SYS_INVOICE_PROPS.shareToken,
      rich_text: { equals: token },
    },
  });
  const page = res.results.find(isFullPage);
  return page ? rowFromPage(page) : null;
}

interface UpsertInvoiceInput {
  userId: string;
  notionPageId: string;
  data: InvoiceData;
  status: InvoiceStatus;
}

/** notionPageId 기준으로 upsert */
export async function upsertInvoice(input: UpsertInvoiceInput): Promise<void> {
  const notion = getMasterClient();
  const dsId = await getDataSourceId(notion, dbId());
  const now = new Date().toISOString().split("T")[0];
  const dataJson = JSON.stringify(input.data);

  const res = await notion.dataSources.query({
    data_source_id: dsId,
    filter: {
      and: [
        { property: NOTION_SYS_INVOICE_PROPS.userId, rich_text: { equals: input.userId } },
        { property: NOTION_SYS_INVOICE_PROPS.notionPageId, rich_text: { equals: input.notionPageId } },
      ],
    },
  });

  const existing = res.results.find(isFullPage);

  const properties = {
    [NOTION_SYS_INVOICE_PROPS.invoiceNumber]: {
      title: [{ text: { content: input.data.invoiceNumber } }],
    },
    [NOTION_SYS_INVOICE_PROPS.userId]: {
      rich_text: [{ text: { content: input.userId } }],
    },
    [NOTION_SYS_INVOICE_PROPS.notionPageId]: {
      rich_text: [{ text: { content: input.notionPageId } }],
    },
    [NOTION_SYS_INVOICE_PROPS.dataJson]: {
      rich_text: [{ text: { content: dataJson } }],
    },
    [NOTION_SYS_INVOICE_PROPS.status]: {
      select: { name: input.status },
    },
    [NOTION_SYS_INVOICE_PROPS.updatedAt]: {
      date: { start: now },
    },
  };

  if (existing) {
    await notion.pages.update({ page_id: existing.id, properties });
  } else {
    await notion.pages.create({ parent: { data_source_id: dsId, type: "data_source_id" }, properties });
  }
}

/** shareToken 업데이트 */
export async function updateShareToken(pageId: string, token: string): Promise<void> {
  const notion = getMasterClient();
  await notion.pages.update({
    page_id: pageId,
    properties: {
      [NOTION_SYS_INVOICE_PROPS.shareToken]: {
        rich_text: [{ text: { content: token } }],
      },
    },
  });
}
