import { NextResponse } from "next/server";
import { getMasterClient } from "@/lib/notion/client";

/** 개발용: Notion DB 연결 확인 엔드포인트 */
export async function GET() {
  const dbId = process.env.NOTION_INVOICES_DB_ID;
  if (!dbId) {
    return NextResponse.json({ ok: false, error: "NOTION_INVOICES_DB_ID 미설정" }, { status: 500 });
  }

  try {
    const notion = getMasterClient();
    const db = await notion.databases.retrieve({ database_id: dbId });
    const raw = JSON.parse(JSON.stringify(db)) as Record<string, unknown>;
    const titleArr = raw.title as Array<{ plain_text: string }> | undefined;
    const title = titleArr?.[0]?.plain_text ?? "(제목 없음)";
    const dataSources = raw.data_sources as Array<{ id: string; name: string }> | undefined;
    const dsId = dataSources?.[0]?.id;

    // dataSources.query로 데이터 조회
    const qRes = dsId
      ? await notion.dataSources.query({ data_source_id: dsId, page_size: 3 })
      : null;
    const pages = qRes?.results ?? [];
    const firstPage = pages[0] as Record<string, unknown> | undefined;
    const propKeys = firstPage?.properties ? Object.keys(firstPage.properties as object) : [];

    return NextResponse.json({ ok: true, dbId, dsId, title, rowCount: pages.length, properties: propKeys });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // Notion API 에러 상세 정보
    const detail = e && typeof e === "object" && "body" in e ? (e as { body: unknown }).body : undefined;
    return NextResponse.json({ ok: false, error: message, detail }, { status: 500 });
  }
}
