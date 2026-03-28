import {
  format,
  parseISO,
  isValid,
  differenceInDays,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  formatDistanceToNow,
} from "date-fns";
import { ko } from "date-fns/locale";

/** 날짜를 지정된 포맷 문자열로 변환 (기본: yyyy-MM-dd) */
export function formatDate(date: Date | string, formatStr = "yyyy-MM-dd"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return format(d, formatStr, { locale: ko });
}

/** ISO 문자열을 Date 객체로 파싱 */
export { parseISO };

/** Date 유효성 검사 */
export { isValid };

/** 두 날짜 사이의 일수 차이 */
export { differenceInDays };

/** 날짜 더하기/빼기 */
export { addDays, subDays };

/** 하루의 시작/끝 */
export { startOfDay, endOfDay };

/** 현재로부터 상대 시간 표시 (예: "3일 전") */
export function fromNow(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) return "";
  return formatDistanceToNow(d, { addSuffix: true, locale: ko });
}
