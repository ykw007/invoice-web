import { getMasterClient, getDataSourceId } from "@/lib/notion/client";
import type { NotionIntegrationRow } from "@/types";
import { NOTION_SYS_INTEGRATION_PROPS } from "@/types";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { isFullPage } from "@notionhq/client";

const dbId = () => {
  const id = process.env.NOTION_INTEGRATIONS_DB_ID;
  if (!id) throw new Error("환경변수 NOTION_INTEGRATIONS_DB_ID가 설정되지 않았습니다.");
  return id;
};

function rowFromPage(page: PageObjectResponse): NotionIntegrationRow {
  const p = page.properties;

  const userIdProp = p[NOTION_SYS_INTEGRATION_PROPS.userId];
  const userId =
    userIdProp?.type === "title"
      ? (userIdProp.title[0]?.plain_text ?? "")
      : "";

  const tokenProp = p[NOTION_SYS_INTEGRATION_PROPS.accessToken];
  const accessToken =
    tokenProp?.type === "rich_text"
      ? (tokenProp.rich_text[0]?.plain_text ?? "")
      : "";

  const invDbProp = p[NOTION_SYS_INTEGRATION_PROPS.invoiceDbId];
  const invoiceDbId =
    invDbProp?.type === "rich_text"
      ? (invDbProp.rich_text[0]?.plain_text || null)
      : null;

  const itmDbProp = p[NOTION_SYS_INTEGRATION_PROPS.itemsDbId];
  const itemsDbId =
    itmDbProp?.type === "rich_text"
      ? (itmDbProp.rich_text[0]?.plain_text || null)
      : null;

  const statusProp = p[NOTION_SYS_INTEGRATION_PROPS.status];
  const statusVal =
    statusProp?.type === "select" ? (statusProp.select?.name ?? "") : "";
  const status: "connected" | "error" =
    statusVal === "error" ? "error" : "connected";

  const connectedAtProp = p[NOTION_SYS_INTEGRATION_PROPS.connectedAt];
  const connectedAt =
    connectedAtProp?.type === "date"
      ? (connectedAtProp.date?.start ?? null)
      : null;

  return { pageId: page.id, userId, accessToken, invoiceDbId, itemsDbId, status, connectedAt };
}

/** userId로 연동 정보 조회 */
export async function findIntegrationByUserId(userId: string): Promise<NotionIntegrationRow | null> {
  const notion = getMasterClient();
  const dsId = await getDataSourceId(notion, dbId());
  const res = await notion.dataSources.query({
    data_source_id: dsId,
    filter: {
      property: NOTION_SYS_INTEGRATION_PROPS.userId,
      title: { equals: userId },
    },
  });
  const page = res.results.find(isFullPage);
  return page ? rowFromPage(page) : null;
}

/** 연동 생성 또는 accessToken 업데이트 */
export async function upsertIntegration(userId: string, accessToken: string): Promise<void> {
  const notion = getMasterClient();
  const existing = await findIntegrationByUserId(userId);
  const now = new Date().toISOString().split("T")[0];

  if (existing) {
    await notion.pages.update({
      page_id: existing.pageId,
      properties: {
        [NOTION_SYS_INTEGRATION_PROPS.accessToken]: {
          rich_text: [{ text: { content: accessToken } }],
        },
        [NOTION_SYS_INTEGRATION_PROPS.status]: {
          select: { name: "connected" },
        },
        [NOTION_SYS_INTEGRATION_PROPS.connectedAt]: {
          date: { start: now },
        },
      },
    });
  } else {
    const dsId = await getDataSourceId(notion, dbId());
    await notion.pages.create({
      parent: { data_source_id: dsId, type: "data_source_id" },
      properties: {
        [NOTION_SYS_INTEGRATION_PROPS.userId]: {
          title: [{ text: { content: userId } }],
        },
        [NOTION_SYS_INTEGRATION_PROPS.accessToken]: {
          rich_text: [{ text: { content: accessToken } }],
        },
        [NOTION_SYS_INTEGRATION_PROPS.status]: {
          select: { name: "connected" },
        },
        [NOTION_SYS_INTEGRATION_PROPS.connectedAt]: {
          date: { start: now },
        },
      },
    });
  }
}

/** Invoice DB ID, Items DB ID 업데이트 */
export async function updateDatabaseIds(
  userId: string,
  invoiceDbId: string,
  itemsDbId: string
): Promise<void> {
  const notion = getMasterClient();
  const existing = await findIntegrationByUserId(userId);
  if (!existing) throw new Error("연동 정보가 없습니다. 먼저 Notion OAuth 연결을 진행해주세요.");

  await notion.pages.update({
    page_id: existing.pageId,
    properties: {
      [NOTION_SYS_INTEGRATION_PROPS.invoiceDbId]: {
        rich_text: [{ text: { content: invoiceDbId } }],
      },
      [NOTION_SYS_INTEGRATION_PROPS.itemsDbId]: {
        rich_text: [{ text: { content: itemsDbId } }],
      },
    },
  });
}

/** 연동 해제 (페이지 in_trash) */
export async function deleteIntegration(userId: string): Promise<void> {
  const notion = getMasterClient();
  const existing = await findIntegrationByUserId(userId);
  if (!existing) return;

  await notion.pages.update({
    page_id: existing.pageId,
    in_trash: true,
  });
}
