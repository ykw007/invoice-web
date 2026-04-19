import { Client } from "@notionhq/client";

let masterClient: Client | null = null;

// Notion SDK v5: database_id → data_source_id 캐시
const dsIdCache = new Map<string, string>();

/** 앱 Internal Integration용 마스터 클라이언트 (싱글톤) */
export function getMasterClient(): Client {
  if (masterClient) return masterClient;

  const token = process.env.NOTION_INTEGRATION_TOKEN;
  if (!token) {
    throw new Error(
      "환경변수 NOTION_INTEGRATION_TOKEN이 설정되지 않았습니다."
    );
  }

  masterClient = new Client({ auth: token });
  return masterClient;
}

/** 사용자 OAuth 액세스 토큰으로 클라이언트 생성 */
export function getUserClient(accessToken: string): Client {
  return new Client({ auth: accessToken });
}

/**
 * Notion SDK v5: database_id에서 data_source_id를 조회 (캐싱)
 * v5에서는 databases.query가 삭제되고 dataSources.query로 대체됨
 */
export async function getDataSourceId(client: Client, databaseId: string): Promise<string> {
  const cached = dsIdCache.get(databaseId);
  if (cached) return cached;

  const db = await client.databases.retrieve({ database_id: databaseId });
  const dataSources = (db as { data_sources?: Array<{ id: string }> }).data_sources;
  const dsId = dataSources?.[0]?.id;
  if (!dsId) throw new Error(`데이터베이스 ${databaseId}에 연결된 데이터 소스가 없습니다.`);

  dsIdCache.set(databaseId, dsId);
  return dsId;
}
