import { SearchX } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/feedback/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-subtle p-4">
      <EmptyState
        action={
          <Link className={buttonVariants({ variant: "primary" })} href="/app">
            Kembali ke dashboard
          </Link>
        }
        className="w-full max-w-lg"
        description="Halaman yang Anda cari tidak tersedia atau sudah dipindahkan."
        icon={SearchX}
        title="Halaman tidak ditemukan"
      />
    </main>
  );
}
