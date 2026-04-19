import { z } from "zod";
import { requiredString } from "./common.schema";

/** 견적서 상태 스키마 */
export const invoiceStatusSchema = z.enum([
  "draft",
  "sent",
  "accepted",
  "rejected",
]);

/** 견적 항목 스키마 */
export const invoiceItemSchema = z.object({
  name: requiredString("항목명"),
  quantity: z
    .number()
    .int("수량은 정수여야 합니다.")
    .positive("수량은 1 이상이어야 합니다."),
  unitPrice: z
    .number()
    .nonnegative("단가는 0원 이상이어야 합니다."),
  subtotal: z
    .number()
    .nonnegative("소계는 0원 이상이어야 합니다."),
});

/** 견적서 JSON 데이터 스키마 */
export const invoiceDataSchema = z.object({
  invoiceNumber: requiredString("견적서 번호"),
  clientName: requiredString("클라이언트명"),
  clientEmail: z.string().email("올바른 이메일 형식이 아닙니다.").optional(),
  issuedAt: z.string().min(1, "발행일을 입력해주세요."),
  dueDate: z.string().optional(),
  items: z
    .array(invoiceItemSchema)
    .min(1, "견적 항목을 최소 1개 이상 입력해주세요."),
  totalAmount: z
    .number()
    .nonnegative("합계 금액은 0원 이상이어야 합니다."),
  note: z.string().optional(),
  taxIncluded: z.boolean(),
});

/** 공유 링크 생성 요청 스키마 */
export const createShareLinkSchema = z.object({
  invoiceId: requiredString("견적서 ID"),
});

export type InvoiceStatusType = z.infer<typeof invoiceStatusSchema>;
export type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;
export type InvoiceDataFormData = z.infer<typeof invoiceDataSchema>;
export type CreateShareLinkFormData = z.infer<typeof createShareLinkSchema>;
