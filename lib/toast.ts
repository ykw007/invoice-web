import { toast as sonnerToast } from "sonner";

/** 성공 토스트 */
export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),

  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description }),

  loading: (message: string) =>
    sonnerToast.loading(message),

  info: (message: string, description?: string) =>
    sonnerToast.info(message, { description }),

  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, { description }),

  /** Promise 기반 토스트 (loading → success/error 자동 전환) */
  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) =>
    sonnerToast.promise(promise, messages),
};
