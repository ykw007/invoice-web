"use client";

import { Save, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface NotionDatabaseFormProps {
  /** 현재 등록된 견적서 DB ID */
  currentDatabaseId?: string | null;
  /** 현재 등록된 항목 DB ID */
  currentItemsDatabaseId?: string | null;
  /** 노션 미연동 시 비활성화 */
  disabled?: boolean;
}

/** DB ID 입력 힌트 도움말 */
function DbIdTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="데이터베이스 ID 확인 방법"
          className="inline-flex text-muted-foreground hover:text-foreground"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-56 text-xs">
        노션 데이터베이스 URL에서 확인할 수 있습니다.
        <br />
        예: notion.so/워크스페이스/<strong>32자리-ID</strong>?v=...
      </TooltipContent>
    </Tooltip>
  );
}

/** 노션 데이터베이스 ID 등록 폼 카드 */
export function NotionDatabaseForm({
  currentDatabaseId,
  currentItemsDatabaseId,
  disabled = false,
}: NotionDatabaseFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">데이터베이스 설정</CardTitle>
        <CardDescription>
          견적서와 항목이 저장된 노션 데이터베이스 ID를 입력합니다.
          {disabled && (
            <span className="ml-1 text-amber-600 dark:text-amber-400">
              (노션 연동 후 사용 가능합니다)
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <Separator />

      {/*
       * TODO: React Hook Form + Zod 유효성 검사 연결
       * - 스키마: lib/schemas/notion.schema.ts
       * - 제출 시: PATCH /api/notion/database 호출
       */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          /* TODO: React Hook Form handleSubmit 연결 */
        }}
      >
        <CardContent className="space-y-4 pt-6">
          {/* 견적서 DB ID */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="database-id" className="text-sm font-medium">
                견적서 데이터베이스 ID
              </Label>
              <span className="text-xs text-destructive" aria-hidden>
                *
              </span>
              <DbIdTooltip />
            </div>
            <Input
              id="database-id"
              name="databaseId"
              type="text"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              defaultValue={currentDatabaseId ?? ""}
              disabled={disabled}
              maxLength={36}
              className="font-mono text-sm"
              aria-describedby="database-id-hint"
              aria-required="true"
            />
            <p
              id="database-id-hint"
              className="text-xs text-muted-foreground"
            >
              노션 Invoice DB의 32자리 ID를 입력하세요.
            </p>
            {/* TODO: React Hook Form 에러 메시지 표시 */}
          </div>

          {/* 항목 DB ID */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="items-database-id" className="text-sm font-medium">
                항목 데이터베이스 ID
              </Label>
              <DbIdTooltip />
            </div>
            <Input
              id="items-database-id"
              name="itemsDatabaseId"
              type="text"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              defaultValue={currentItemsDatabaseId ?? ""}
              disabled={disabled}
              maxLength={36}
              className="font-mono text-sm"
              aria-describedby="items-database-id-hint"
            />
            <p
              id="items-database-id-hint"
              className="text-xs text-muted-foreground"
            >
              견적 항목이 저장된 Items DB ID를 입력하세요. (선택)
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            size="sm"
            disabled={disabled}
            aria-label="데이터베이스 ID 저장"
          >
            <Save className="mr-2 h-4 w-4" />
            저장
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
