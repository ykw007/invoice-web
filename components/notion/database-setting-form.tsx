"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Save, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { FormField } from "@/components/common/form-field";
import {
  notionDatabaseSettingSchema,
  type NotionDatabaseSettingFormData,
} from "@/lib/schemas/notion.schema";
import { toast } from "@/lib/toast";
import type { ApiErrorResponse } from "@/types";

interface DatabaseSettingFormProps {
  /** 현재 등록된 견적서 DB ID */
  currentDatabaseId?: string | null;
  /** 현재 등록된 항목 DB ID */
  currentItemsDatabaseId?: string | null;
  /** 노션 미연동 시 비활성화 */
  disabled?: boolean;
}

/** DB ID 입력 도움말 툴팁 */
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

/**
 * 노션 DB ID 설정 폼 컴포넌트
 * - databaseId (견적서 DB), itemsDatabaseId (항목 DB) 2개 필드
 * - POST /api/notion/database 호출
 * - 성공: 토스트 + notion status 캐시 무효화
 * - 실패: 에러 토스트
 */
export function DatabaseSettingForm({
  currentDatabaseId,
  currentItemsDatabaseId,
  disabled = false,
}: DatabaseSettingFormProps) {
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<NotionDatabaseSettingFormData>({
    resolver: zodResolver(notionDatabaseSettingSchema),
    defaultValues: {
      databaseId: currentDatabaseId ?? "",
      itemsDatabaseId: currentItemsDatabaseId ?? "",
    },
  });

  const onSubmit = async (data: NotionDatabaseSettingFormData) => {
    try {
      const res = await fetch("/api/notion/database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const json: { success: boolean; message?: string } = await res.json();

      if (!res.ok || !json.success) {
        const errJson = json as ApiErrorResponse;
        toast.error("저장 실패", errJson.message ?? "데이터베이스 ID 저장에 실패했습니다.");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["notion", "status"] });
      toast.success("저장 완료", "데이터베이스 ID가 저장되었습니다.");
    } catch {
      toast.error("저장 실패", "네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

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

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 pt-6">
          {/* 견적서 DB ID */}
          <FormField
            control={control}
            name="databaseId"
            label="견적서 데이터베이스 ID"
            required
            render={({ value, onChange, onBlur }) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <DbIdTooltip />
                </div>
                <Input
                  id="databaseId"
                  type="text"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={typeof value === "string" ? value : ""}
                  onChange={onChange}
                  onBlur={onBlur}
                  disabled={disabled}
                  maxLength={36}
                  className="font-mono text-sm"
                  aria-describedby="databaseId-hint"
                />
                <p id="databaseId-hint" className="text-xs text-muted-foreground">
                  노션 Invoice DB의 ID를 입력하세요. (32자리 16진수)
                </p>
              </div>
            )}
          />

          {/* 항목 DB ID */}
          <FormField
            control={control}
            name="itemsDatabaseId"
            label="항목 데이터베이스 ID"
            required
            render={({ value, onChange, onBlur }) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <DbIdTooltip />
                </div>
                <Input
                  id="itemsDatabaseId"
                  type="text"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={typeof value === "string" ? value : ""}
                  onChange={onChange}
                  onBlur={onBlur}
                  disabled={disabled}
                  maxLength={36}
                  className="font-mono text-sm"
                  aria-describedby="itemsDatabaseId-hint"
                />
                <p id="itemsDatabaseId-hint" className="text-xs text-muted-foreground">
                  견적 항목이 저장된 Items DB ID를 입력하세요.
                </p>
              </div>
            )}
          />
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            size="sm"
            disabled={disabled || isSubmitting}
            aria-label="데이터베이스 ID 저장"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                저장
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
