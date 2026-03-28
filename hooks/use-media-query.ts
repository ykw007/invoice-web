"use client";
import { useMediaQuery as useResponsiveMediaQuery } from "react-responsive";

/** CSS 미디어 쿼리 문자열을 인자로 받아 매칭 여부 반환 */
export function useMediaQuery(query: string): boolean {
  return useResponsiveMediaQuery({ query });
}
