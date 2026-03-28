import { z } from "zod";

/** 이메일 스키마 */
export const emailSchema = z
  .string()
  .min(1, "이메일을 입력해주세요.")
  .email("올바른 이메일 형식이 아닙니다.");

/** 비밀번호 스키마 */
export const passwordSchema = z
  .string()
  .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
  .max(128, "비밀번호는 최대 128자까지 입력 가능합니다.")
  .regex(/[A-Za-z]/, "영문자를 포함해야 합니다.")
  .regex(/[0-9]/, "숫자를 포함해야 합니다.");

/** 전화번호 스키마 */
export const phoneSchema = z
  .string()
  .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, "올바른 전화번호 형식이 아닙니다.");

/** URL 스키마 */
export const urlSchema = z
  .string()
  .url("올바른 URL 형식이 아닙니다.");

/** 필수 문자열 스키마 팩토리 */
export const requiredString = (label: string) =>
  z.string().min(1, `${label}을(를) 입력해주세요.`);
