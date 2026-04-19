"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfDownloadButtonProps {
  /** 다운로드 파일명 (예: inv-2026-001.pdf) */
  filename: string;
}

/**
 * PDF 다운로드 버튼 클라이언트 컴포넌트
 * TODO: @react-pdf/renderer BlobProvider 연결 구현
 */
export function PdfDownloadButton({ filename }: PdfDownloadButtonProps) {
  const handleDownload = () => {
    /* TODO: @react-pdf/renderer로 PDF blob 생성 후 다운로드 */
    void filename;
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      aria-label={`${filename} PDF 다운로드`}
    >
      <Download className="mr-2 h-4 w-4" />
      PDF 다운로드
    </Button>
  );
}
