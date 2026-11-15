import { Construction } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/layout";

export function PhasePlaceholder({
  description = "Halaman ini akan diisi pada fase pengembangan berikutnya.",
  phase = "Fase 2",
  title,
}: {
  description?: string;
  phase?: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        actions={<Badge tone="info">{phase}</Badge>}
        description="Placeholder UI untuk memverifikasi shell, navigasi, dan design system."
        title={title}
      />
      <EmptyState
        description={description}
        icon={Construction}
        title={`${title} belum diimplementasikan`}
      />
    </div>
  );
}
