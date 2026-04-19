import { z } from "zod";
import { requiredString } from "./common.schema";

/**
 * 노션 데이터베이스 ID 형식 검증
 * 노션 DB ID: 32자리 16진수 (하이픈 포함 시 36자)
 */
const notionDatabaseIdSchema = z
  .string()
  .min(1, "데이터베이스 ID를 입력해주세요.")
  .regex(
    /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i,
    "올바른 노션 데이터베이스 ID 형식이 아닙니다. (예: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
  );

/** 노션 데이터베이스 ID 등록 폼 스키마 */
export const notionDatabaseSettingSchema = z.object({
  databaseId: notionDatabaseIdSchema,
  itemsDatabaseId: notionDatabaseIdSchema,
});

/** 노션 동기화 요청 스키마 */
export const notionSyncSchema = z.object({
  /** 동기화할 데이터베이스 ID (미입력 시 등록된 기본 DB 사용) */
  databaseId: requiredString("데이터베이스 ID").optional(),
});

/** 노션 OAuth 콜백 스키마 (API Route 검증용) */
export const notionOAuthCallbackSchema = z.object({
  code: requiredString("인증 코드"),
  state: z.string().optional(),
});

export type NotionDatabaseSettingFormData = z.infer<
  typeof notionDatabaseSettingSchema
>;
export type NotionSyncFormData = z.infer<typeof notionSyncSchema>;
export type NotionOAuthCallbackData = z.infer<typeof notionOAuthCallbackSchema>;
