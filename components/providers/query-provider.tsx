"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import type { BaseProps } from "@/types";
import { UnauthorizedError } from "@/lib/errors";

function handleUnauthorized(error: unknown) {
  if (error instanceof UnauthorizedError) {
    // TODO: 인증 구현 후 주석 해제
    // document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    // window.location.href = "/login";
  }
}

/** TanStack Query QueryClient Provider */
export function QueryProvider({ children }: BaseProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: handleUnauthorized }),
        mutationCache: new MutationCache({ onError: handleUnauthorized }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
