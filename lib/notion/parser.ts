import { isFullPage } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { InvoiceItem, InvoiceData, InvoiceStatus } from "@/types";
import {
  NOTION_INVOICE_PROPS,
  NOTION_ITEM_PROPS,
  NOTION_STATUS_MAP,
} from "@/types";
import { invoiceDataSchema } from "@/lib/schemas/invoice.schema";

/** 파싱 성공 결과 */
export type ParseSuccess = {
  ok: true;
  notionPageId: string;
  data: InvoiceData;
  status: InvoiceStatus;
};

/** 파싱 실패 결과 */
export type ParseError = {
  ok: false;
  notionPageId: string;
  error: string;
};

/** 파싱 결과 유니온 타입 */
export type ParseResult = ParseSuccess | ParseError;

/**
 * Rich Text 배열에서 plain_text를 추출합니다.
 * 빈 배열이면 빈 문자열을 반환합니다.
 */
function extractRichText(
  richTextArr: Array<{ plain_text: string }>
): string {
  return richTextArr.map((t) => t.plain_text).join("").trim();
}

/**
 * Items DB 페이지 하나를 InvoiceItem으로 파싱합니다.
 * 항목명이 비어있으면 null을 반환합니다.
 */
export function parseItemPage(
  page: PageObjectResponse
): InvoiceItem | null {
  const props = page.properties;

  // 항목명 추출 (Title 타입)
  const nameProp = props[NOTION_ITEM_PROPS.name];
  if (nameProp?.type !== "title") return null;
  const name = extractRichText(nameProp.title);
  if (!name) return null;

  // 수량 추출 (Number 타입)
  const quantityProp = props[NOTION_ITEM_PROPS.quantity];
  const quantity =
    quantityProp?.type === "number" ? (quantityProp.number ?? 0) : 0;

  // 단가 추출 (Number 타입)
  const unitPriceProp = props[NOTION_ITEM_PROPS.unitPrice];
  const unitPrice =
    unitPriceProp?.type === "number" ? (unitPriceProp.number ?? 0) : 0;

  // 소계 추출 (Formula 타입, 없으면 수량×단가 fallback)
  const subtotalProp = props[NOTION_ITEM_PROPS.subtotal];
  let subtotal: number;
  if (
    subtotalProp?.type === "formula" &&
    subtotalProp.formula.type === "number" &&
    subtotalProp.formula.number !== null
  ) {
    subtotal = subtotalProp.formula.number;
  } else {
    subtotal = quantity * unitPrice;
  }

  return { name, quantity, unitPrice, subtotal };
}

/**
 * Invoice DB 페이지 하나를 ParseResult로 파싱합니다.
 * Zod safeParse로 최종 검증을 수행합니다.
 */
export function parseInvoicePage(
  page: PageObjectResponse,
  items: InvoiceItem[]
): ParseResult {
  try {
    const props = page.properties;

    // 견적서 번호 (Title 타입)
    const invoiceNumberProp = props[NOTION_INVOICE_PROPS.invoiceNumber];
    const invoiceNumber =
      invoiceNumberProp?.type === "title"
        ? extractRichText(invoiceNumberProp.title)
        : "";

    // 클라이언트명 (Rich Text 타입)
    const clientNameProp = props[NOTION_INVOICE_PROPS.clientName];
    const clientName =
      clientNameProp?.type === "rich_text"
        ? extractRichText(clientNameProp.rich_text)
        : "";

    // 클라이언트 이메일 (Email 타입)
    const clientEmailProp = props[NOTION_INVOICE_PROPS.clientEmail];
    const clientEmail =
      clientEmailProp?.type === "email" && clientEmailProp.email
        ? clientEmailProp.email
        : undefined;

    // 발행일 (Date 타입)
    const issuedAtProp = props[NOTION_INVOICE_PROPS.issuedAt];
    const issuedAt =
      issuedAtProp?.type === "date" && issuedAtProp.date?.start
        ? issuedAtProp.date.start
        : "";

    // 유효기한 (Date 타입)
    const dueDateProp = props[NOTION_INVOICE_PROPS.dueDate];
    const dueDate =
      dueDateProp?.type === "date" && dueDateProp.date?.start
        ? dueDateProp.date.start
        : undefined;

    // 상태 (Select 타입) — 한국어 → InvoiceStatus 변환
    const statusProp = props[NOTION_INVOICE_PROPS.status];
    const selectName =
      statusProp?.type === "select" && statusProp.select?.name
        ? statusProp.select.name
        : "";
    const status: InvoiceStatus = NOTION_STATUS_MAP[selectName] ?? "draft";

    // 세금 포함 (Checkbox 타입) — 미설정 시 false 기본값
    const taxIncludedProp = props[NOTION_INVOICE_PROPS.taxIncluded];
    const taxIncluded =
      taxIncludedProp?.type === "checkbox" ? taxIncludedProp.checkbox : false;

    // 메모 (Rich Text 타입)
    const noteProp = props[NOTION_INVOICE_PROPS.note];
    const note =
      noteProp?.type === "rich_text"
        ? extractRichText(noteProp.rich_text) || undefined
        : undefined;

    // 합계 금액 (Rollup 타입 — number)
    const totalAmountProp = props[NOTION_INVOICE_PROPS.totalAmount];
    let totalAmount = 0;
    if (
      totalAmountProp?.type === "rollup" &&
      totalAmountProp.rollup.type === "number" &&
      totalAmountProp.rollup.number !== null
    ) {
      totalAmount = totalAmountProp.rollup.number;
    } else {
      // Rollup을 못 읽으면 items 합산으로 fallback
      totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    }

    // 견적서 데이터 조립
    const rawData = {
      invoiceNumber,
      clientName,
      clientEmail,
      issuedAt,
      dueDate,
      items,
      totalAmount,
      note,
      taxIncluded,
    };

    // Zod 스키마 검증
    const result = invoiceDataSchema.safeParse(rawData);
    if (!result.success) {
      return {
        ok: false,
        notionPageId: page.id,
        error: result.error.message,
      };
    }

    return {
      ok: true,
      notionPageId: page.id,
      data: result.data,
      status,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      notionPageId: page.id,
      error: message,
    };
  }
}

