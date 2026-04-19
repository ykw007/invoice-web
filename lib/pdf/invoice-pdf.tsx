"use client";

import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Invoice, Issuer } from "@/types";
import { INVOICE_STATUS_LABEL } from "@/types";

/**
 * Noto Sans KR 폰트 등록 (모듈 최상위 1회 호출 — 한글 깨짐 방지)
 * Google Fonts CDN 사용
 */
Font.register({
  family: "NotoSansKR",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgm20HTs4JMMmA.otf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgm203Ts4JMMmA.otf",
      fontWeight: 700,
    },
  ],
});

/** 금액을 한국 원화 형식으로 포맷 */
function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** 세율 10% */
const TAX_RATE = 0.1;

/** PDF 스타일시트 */
const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansKR",
    fontSize: 10,
    padding: 40,
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  /* 헤더 섹션 */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  issuerBlock: {
    flexDirection: "column",
    gap: 2,
  },
  issuerLabel: {
    fontSize: 7,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  issuerName: {
    fontSize: 13,
    fontWeight: 700,
  },
  issuerContact: {
    fontSize: 9,
    color: "#6b7280",
  },
  invoiceBlock: {
    alignItems: "flex-end",
    gap: 2,
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 700,
  },
  invoiceNumber: {
    fontSize: 10,
    color: "#6b7280",
  },
  statusBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: "#dbeafe",
    borderRadius: 4,
    fontSize: 8,
    color: "#1d4ed8",
  },
  /* 구분선 */
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginVertical: 12,
  },
  /* 메타 섹션 (클라이언트/날짜) */
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  metaBlock: {
    flexDirection: "column",
    gap: 3,
  },
  metaLabel: {
    fontSize: 7,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: 700,
  },
  metaSubValue: {
    fontSize: 9,
    color: "#6b7280",
  },
  /* 항목 테이블 */
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  colName: { flex: 3, fontSize: 9 },
  colQty: { flex: 1, textAlign: "right", fontSize: 9 },
  colPrice: { flex: 2, textAlign: "right", fontSize: 9 },
  colSubtotal: { flex: 2, textAlign: "right", fontSize: 9, fontWeight: 700 },
  tableHeaderText: { color: "#6b7280", fontSize: 8 },
  /* 합계 섹션 */
  summarySection: {
    alignItems: "flex-end",
    marginTop: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingVertical: 3,
  },
  summaryLabel: { fontSize: 9, color: "#6b7280" },
  summaryValue: { fontSize: 9 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: "#111827",
    marginTop: 4,
  },
  totalLabel: { fontSize: 11, fontWeight: 700 },
  totalValue: { fontSize: 11, fontWeight: 700 },
  /* 메모 */
  noteSection: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
  },
  noteLabel: {
    fontSize: 7,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.5,
  },
  /* 인쇄 푸터 */
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
});

interface InvoicePdfProps {
  /** 견적서 데이터 */
  invoice: Invoice;
  /** 발행자 정보 */
  issuer: Issuer;
}

/**
 * 견적서 PDF Document 컴포넌트
 * - @react-pdf/renderer 사용
 * - Noto Sans KR 폰트로 한글 깨짐 방지
 * - 헤더 / 메타(클라이언트+날짜) / 항목 테이블 / 합계 / 메모 구조
 */
export function InvoicePdf({ invoice, issuer }: InvoicePdfProps) {
  const { data, status } = invoice;

  /* 세금 계산 */
  const taxAmount = data.taxIncluded
    ? Math.round(data.totalAmount - data.totalAmount / (1 + TAX_RATE))
    : Math.round(data.totalAmount * TAX_RATE);

  const grandTotal = data.taxIncluded
    ? data.totalAmount
    : data.totalAmount + taxAmount;

  return (
    <Document
      title={`견적서 ${data.invoiceNumber}`}
      author={issuer.name}
      subject="견적서"
    >
      <Page size="A4" style={styles.page}>
        {/* 헤더: 발행자 / 견적서 번호+상태 */}
        <View style={styles.header}>
          {/* 발행자 정보 */}
          <View style={styles.issuerBlock}>
            <Text style={styles.issuerLabel}>발행자</Text>
            <Text style={styles.issuerName}>{issuer.name}</Text>
            {issuer.contact && (
              <Text style={styles.issuerContact}>{issuer.contact}</Text>
            )}
          </View>

          {/* 견적서 정보 */}
          <View style={styles.invoiceBlock}>
            <Text style={styles.invoiceTitle}>견적서</Text>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
            <Text style={styles.statusBadge}>
              {INVOICE_STATUS_LABEL[status]}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 메타: 클라이언트 / 날짜 */}
        <View style={styles.metaSection}>
          {/* 수신자 */}
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>수신자</Text>
            <Text style={styles.metaValue}>{data.clientName}</Text>
            {data.clientEmail && (
              <Text style={styles.metaSubValue}>{data.clientEmail}</Text>
            )}
          </View>

          {/* 날짜 정보 */}
          <View style={[styles.metaBlock, { alignItems: "flex-end" }]}>
            <Text style={styles.metaLabel}>발행일</Text>
            <Text style={styles.metaValue}>{data.issuedAt}</Text>
            {data.dueDate && (
              <>
                <Text style={[styles.metaLabel, { marginTop: 6 }]}>유효기한</Text>
                <Text style={styles.metaValue}>{data.dueDate}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* 항목 테이블 헤더 */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colName, styles.tableHeaderText]}>품목</Text>
          <Text style={[styles.colQty, styles.tableHeaderText]}>수량</Text>
          <Text style={[styles.colPrice, styles.tableHeaderText]}>단가</Text>
          <Text style={[styles.colSubtotal, styles.tableHeaderText]}>소계</Text>
        </View>

        {/* 항목 행 */}
        {data.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.colName}>{item.name}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{formatKRW(item.unitPrice)}</Text>
            <Text style={styles.colSubtotal}>{formatKRW(item.subtotal)}</Text>
          </View>
        ))}

        {/* 합계 섹션 */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>소계</Text>
            <Text style={styles.summaryValue}>{formatKRW(data.totalAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              부가세 (10%) {data.taxIncluded ? "[포함]" : "[별도]"}
            </Text>
            <Text style={styles.summaryValue}>
              {data.taxIncluded ? "−" : "+"} {formatKRW(taxAmount)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>총계</Text>
            <Text style={styles.totalValue}>{formatKRW(grandTotal)}</Text>
          </View>
        </View>

        {/* 메모 (있을 때만) */}
        {data.note && (
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>메모</Text>
            <Text style={styles.noteText}>{data.note}</Text>
          </View>
        )}

        {/* 인쇄 푸터 */}
        <Text style={styles.footer}>
          본 견적서는 자동 생성되었습니다.
        </Text>
      </Page>
    </Document>
  );
}
