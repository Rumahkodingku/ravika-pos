"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: true },
      mutations: { retry: 0 },
    },
  });
}

function UnauthorizedListener() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const handleUnauthorized = () => {
      queryClient.clear();

      const next = `${window.location.pathname}${window.location.search}`;

      if (next.startsWith("/login")) {
        return;
      }

      const target =
        next === "/" || next === ""
          ? "/login"
          : `/login?next=${encodeURIComponent(next)}`;

      router.replace(target);
    };

    window.addEventListener("ravika:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("ravika:unauthorized", handleUnauthorized);
    };
  }, [queryClient, router]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <UnauthorizedListener />
      {children}
    </QueryClientProvider>
  );
}
