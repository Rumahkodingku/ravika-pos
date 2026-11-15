import { ShieldX } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";

export function PermissionDeniedState({
  action,
  description = "Anda tidak memiliki izin untuk membuka halaman atau tindakan ini.",
  title = "Akses ditolak",
}: {
  action?: React.ReactNode;
  description?: string;
  title?: string;
}) {
  return (
    <EmptyState
      action={action}
      description={description}
      icon={ShieldX}
      title={title}
    />
  );
}
