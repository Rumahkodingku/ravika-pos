import { WifiOff } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

export function OfflineState({
  onRetry,
  title = "Koneksi ke server terputus",
}: {
  onRetry?: () => void;
  title?: string;
}) {
  return (
    <EmptyState
      action={
        onRetry ? (
          <Button onClick={onRetry} variant="outline">
            Coba lagi
          </Button>
        ) : undefined
      }
      description="Periksa koneksi LAN/Wi-Fi ke komputer server, lalu coba lagi."
      icon={WifiOff}
      title={title}
    />
  );
}
