"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { InvoicePdf } from "@/lib/pdf/invoice-pdf";
import { toast } from "@/lib/toast";
import type { Invoice, Issuer } from "@/types";

interface PdfDownloadButtonProps {
  /** 견적서 데이터 */
  invoice: Invoice;
  /** 발행자 정보 */
  issuer: Issuer;
}

/**
 * 파일명 안전 문자열로 sanitize
 * 허용: 영문자, 숫자, 한글, 하이픈
 */
function sanitizeFilename(str: string): string {
  return str.replace(/[^a-zA-Z0-9가-힣-]/g, "");
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * PDF 다운로드 버튼 컴포넌트
 * - pdf(<InvoicePdf />).toBlob() → URL.createObjectURL() → a.click() 패턴
 * - 파일명: invoice-{invoiceNumber}-{YYYY-MM-DD}.pdf
 * - 로딩 중 버튼 비활성화 + LoadingSpinner 표시
 */
export function PdfDownloadButton({ invoice, issuer }: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    let objectUrl: string | null = null;

    try {
      /* PDF blob 생성 */
      const blob = await pdf(
        <InvoicePdf invoice={invoice} issuer={issuer} />
      ).toBlob();

      /* 파일명 생성: invoice-{번호sanitize}-{날짜}.pdf */
      const safeNumber = sanitizeFilename(invoice.data.invoiceNumber);
      const filename = `invoice-${safeNumber}-${getTodayString()}.pdf`;

      /* 다운로드 트리거 */
      objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      toast.error("PDF 생성 실패", "PDF 파일을 생성하는 중 오류가 발생했습니다.");
    } finally {
      /* objectURL 메모리 해제 */
      if (objectUrl) {
        setTimeout(() => URL.revokeObjectURL(objectUrl!), 1000);
      }
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isGenerating}
      aria-label="견적서 PDF 다운로드"
    >
      {isGenerating ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          생성 중...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          PDF 다운로드
        </>
      )}
    </Button>
  );
}
