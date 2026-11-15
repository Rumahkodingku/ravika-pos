"use client";

import { ErrorState } from "@/components/feedback/error-state";

export function ShellError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      description="Halaman gagal dimuat. Coba lagi atau hubungi pengelola sistem jika masalah berlanjut."
      onRetry={reset}
      title="Terjadi kesalahan"
    />
  );
}
