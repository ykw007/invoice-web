import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PublicInvoiceHeader } from "@/components/viewer/public-invoice-header";
import { PublicInvoiceBody } from "@/components/viewer/public-invoice-body";
import { PdfDownloadButton } from "@/components/viewer/pdf-download-button";
import type { ApiResponse, Invoice, Issuer } from "@/types";

interface ViewPageProps {
  params: Promise<{ token: string }>;
}

/** 공개 뷰어 API 응답 DTO */
interface ViewTokenResponse {
  invoice: Invoice;
  issuer: Issuer;
}

/**
 * 토큰으로 견적서 데이터를 서버에서 조회
 * - GET /api/view/[token] 호출
 * - 404 → null 반환 → notFound() 처리
 * - 기타 오류 → null 반환
 */
async function fetchViewData(token: string): Promise<ViewTokenResponse | null> {
  try {
    /* 서버 컴포넌트에서 절대 URL 생성 */
    const headerStore = await headers();
    const host = headerStore.get("host") ?? "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/view/${token}`, {
      cache: "no-store",
    });

    if (res.status === 404) return null;
    if (!res.ok) return null;

    const json: ApiResponse<ViewTokenResponse> = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

/**
 * 공개 견적서 뷰어 페이지 (서버 컴포넌트)
 * - 로그인 없이 share_token으로 접근 가능
 * - 유효하지 않은 토큰 → notFound()
 * - PublicInvoiceHeader + PublicInvoiceBody + PdfDownloadButton
 * - 인쇄 최적화 레이아웃 (사이드바 없음 — layout.tsx)
 */
export default async function InvoiceViewPage({ params }: ViewPageProps) {
  const { token } = await params;

  /* API에서 404 응답 → Next.js notFound() */
  const viewData = await fetchViewData(token);

  if (!viewData) {
    notFound();
  }

  const { invoice, issuer } = viewData;

  return (
    <div className="min-h-screen bg-muted/30 print:bg-white">
      {/* 상단 액션 바 — 인쇄 시 숨김 */}
      <header
        className="sticky top-0 z-10 border-b bg-background/95 px-4 py-3 backdrop-blur-sm print:hidden"
        aria-label="견적서 액션 바"
      >
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          {/* 발행자 브랜드 + 견적서 번호 */}
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold">{issuer.name}</span>
            <span className="hidden text-muted-foreground sm:inline" aria-hidden="true">
              ·
            </span>
            <span className="hidden truncate text-sm text-muted-foreground sm:inline">
              {invoice.data.invoiceNumber}
            </span>
          </div>

          {/* PDF 다운로드 버튼 (클라이언트 컴포넌트) */}
          <PdfDownloadButton invoice={invoice} issuer={issuer} />
        </div>
      </header>

      {/* 견적서 본문 */}
      <main className="mx-auto max-w-4xl px-4 py-8 print:p-0">
        <article
          className="rounded-xl border bg-white shadow-sm print:border-none print:shadow-none"
          aria-label={`견적서 ${invoice.data.invoiceNumber}`}
        >
          {/* 헤더: 발행자 / 클라이언트 / 상태 */}
          <div className="p-8 pb-6 print:p-6">
            <PublicInvoiceHeader
              issuer={issuer}
              invoiceData={invoice.data}
              status={invoice.status}
            />
          </div>

          <Separator />

          {/* 본문: 날짜 / 항목 테이블 / 합계 / 메모 */}
          <div className="px-8 print:px-6">
            <PublicInvoiceBody invoiceData={invoice.data} />
          </div>
        </article>

        {/* 인쇄 안내 — 화면에서만 표시 */}
        <p className="mt-4 text-center text-xs text-muted-foreground print:hidden">
          브라우저 인쇄 기능(Ctrl+P)으로 PDF를 저장하거나, 위의 PDF 다운로드 버튼을 사용하세요.
        </p>
      </main>
    </div>
  );
}

/**
 * 토큰 무효/만료 시 커스텀 not-found 페이지 대신
 * app/not-found.tsx 또는 app/view/[token]/not-found.tsx 작성 가능.
 * 현재는 next/notFound()로 기본 404 처리.
 */
export function generateStaticParams() {
  return [];
}
