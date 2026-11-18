import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, type RenderResult, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { SessionProvider } from "@/features/auth/session-provider";
import type { SessionUser } from "@/types/auth";

afterEach(cleanup);

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  options: { user?: SessionUser } = {},
): RenderResult {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {options.user ? (
          <SessionProvider user={options.user}>{ui}</SessionProvider>
        ) : (
          ui
        )}
      </ToastProvider>
    </QueryClientProvider>,
  );
}
