"use client";

import { ShellError } from "@/components/feedback/shell-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ShellError error={error} reset={reset} />;
}
