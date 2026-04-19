import { getMasterClient, getDataSourceId } from "@/lib/notion/client";
import type { NotionUserRow } from "@/types";
import { NOTION_SYS_USER_PROPS } from "@/types";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { isFullPage } from "@notionhq/client";

const dbId = () => {
  const id = process.env.NOTION_USERS_DB_ID;
  if (!id) throw new Error("환경변수 NOTION_USERS_DB_ID가 설정되지 않았습니다.");
  return id;
};

function rowFromPage(page: PageObjectResponse): NotionUserRow {
  const p = page.properties;

  const nameProp = p[NOTION_SYS_USER_PROPS.name];
  const name =
    nameProp?.type === "title"
      ? (nameProp.title[0]?.plain_text ?? "")
      : "";

  const emailProp = p[NOTION_SYS_USER_PROPS.email];
  const email =
    emailProp?.type === "email" ? (emailProp.email ?? "") : "";

  const hashProp = p[NOTION_SYS_USER_PROPS.passwordHash];
  const passwordHash =
    hashProp?.type === "rich_text"
      ? (hashProp.rich_text[0]?.plain_text ?? "")
      : "";

  const createdAtProp = p[NOTION_SYS_USER_PROPS.createdAt];
  const createdAt =
    createdAtProp?.type === "date"
      ? (createdAtProp.date?.start ?? "")
      : "";

  return { pageId: page.id, name, email, passwordHash, createdAt };
}

/** 이메일로 사용자 조회 */
export async function findUserByEmail(email: string): Promise<NotionUserRow | null> {
  const notion = getMasterClient();
  const dsId = await getDataSourceId(notion, dbId());
  const res = await notion.dataSources.query({
    data_source_id: dsId,
    filter: {
      property: NOTION_SYS_USER_PROPS.email,
      email: { equals: email },
    },
  });

  const page = res.results.find(isFullPage);
  return page ? rowFromPage(page) : null;
}

/** 페이지 ID로 사용자 조회 */
export async function findUserById(pageId: string): Promise<NotionUserRow | null> {
  const notion = getMasterClient();
  const page = await notion.pages.retrieve({ page_id: pageId });
  return isFullPage(page) ? rowFromPage(page) : null;
}

/** 사용자 생성 */
export async function createUser(
  name: string,
  email: string,
  passwordHash: string
): Promise<NotionUserRow> {
  const notion = getMasterClient();
  const dsId = await getDataSourceId(notion, dbId());
  const now = new Date().toISOString().split("T")[0];

  const page = await notion.pages.create({
    parent: { data_source_id: dsId, type: "data_source_id" },
    properties: {
      [NOTION_SYS_USER_PROPS.name]: {
        title: [{ text: { content: name } }],
      },
      [NOTION_SYS_USER_PROPS.email]: { email },
      [NOTION_SYS_USER_PROPS.passwordHash]: {
        rich_text: [{ text: { content: passwordHash } }],
      },
      [NOTION_SYS_USER_PROPS.createdAt]: {
        date: { start: now },
      },
    },
  });

  if (!isFullPage(page)) throw new Error("사용자 생성에 실패했습니다.");
  return rowFromPage(page);
}
