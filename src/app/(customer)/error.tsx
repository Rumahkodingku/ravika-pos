"use client";

import { ShellError } from "@/components/feedback/shell-error";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ShellError error={error} reset={reset} />;
}
