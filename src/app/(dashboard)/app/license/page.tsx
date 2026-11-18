"use client";

import { BadgeCheck, RefreshCw } from "lucide-react";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusinessQuery } from "@/features/management/api/business";
import { useLicenseQuery } from "@/features/management/api/system";
import { RequirePermission } from "@/features/management/permission-gate";
import { formatDate } from "@/lib/format";
import type { LicenseStatus } from "@/types/domain";

const statusLabels: Record<LicenseStatus, string> = {
  VALID: "Valid",
  EXPIRING: "Segera berakhir",
  INVALID: "Tidak valid",
};

const statusTones: Record<LicenseStatus, "success" | "warning" | "danger"> = {
  VALID: "success",
  EXPIRING: "warning",
  INVALID: "danger",
};

export default function LicensePage() {
  const business = useBusinessQuery();
  const { data, error, isLoading, isFetching, refetch } = useLicenseQuery();

  return (
    <RequirePermission permission="license.view">
      <div className="flex flex-col gap-6">
        <PageHeader
          actions={
            <Button
              isLoading={isFetching}
              onClick={() => void refetch()}
              variant="outline"
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Perbarui status
            </Button>
          }
          description="Status lisensi instalasi."
          title="Lisensi"
        />

        {isLoading ? (
          <Skeleton className="h-80" />
        ) : error ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : data ? (
          <Card>
            <CardHeader
              action={
                <Badge tone={statusTones[data.status]}>
                  {statusLabels[data.status]}
                </Badge>
              }
              description="Validasi lokal terhadap file lisensi instalasi."
              title="Lisensi RAVIKA POS"
            />
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <span className="text-caption text-muted-foreground">
                  Nama bisnis
                </span>
                <span className="text-body font-medium text-foreground">
                  {business.data?.name ?? "Tidak ada"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-caption text-muted-foreground">
                  Business identifier
                </span>
                <span className="text-body font-medium text-foreground">
                  {data.businessIdentifier}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-caption text-muted-foreground">
                  Installation ID
                </span>
                <span className="text-body font-medium text-foreground">
                  {data.installationId}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-caption text-muted-foreground">
                  Public key fingerprint
                </span>
                <span className="break-all text-body font-medium text-foreground">
                  {data.publicKeyFingerprint}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-caption text-muted-foreground">
                  Tanggal terbit
                </span>
                <span className="text-body font-medium text-foreground">
                  {formatDate(data.issuedAt)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-caption text-muted-foreground">
                  Masa berlaku
                </span>
                <span className="text-body font-medium text-foreground">
                  {formatDate(data.expiresAt)}
                </span>
              </div>
              {data.validationMessage ? (
                <div className="flex items-center gap-2 rounded-md border border-border bg-surface-subtle p-3 sm:col-span-2">
                  <BadgeCheck
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-muted-foreground"
                  />
                  <p className="text-caption text-muted-foreground">
                    {data.validationMessage}
                  </p>
                </div>
              ) : null}
              <div className="flex items-center gap-2 rounded-md border border-border bg-surface-subtle p-3 sm:col-span-2">
                <BadgeCheck
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-muted-foreground"
                />
                <p className="text-caption text-muted-foreground">
                  Aktivasi dan unggah lisensi belum tersedia.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </RequirePermission>
  );
}
