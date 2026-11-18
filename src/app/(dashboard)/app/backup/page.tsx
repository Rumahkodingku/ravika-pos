"use client";

import { DatabaseBackup, RotateCcw } from "lucide-react";
import { useState } from "react";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import {
  useBackupsQuery,
  useCreateBackupMutation,
  useRestoreBackupMutation,
} from "@/features/management/api/system";
import { ConfirmDialog } from "@/features/management/confirm-dialog";
import {
  PermissionGate,
  RequirePermission,
} from "@/features/management/permission-gate";
import { ResponsiveList } from "@/features/management/responsive-list";
import { formatDateTime } from "@/lib/format";
import type { BackupRecord } from "@/types/domain";

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

export default function BackupPage() {
  const { toast } = useToast();
  const [restoreTarget, setRestoreTarget] = useState<BackupRecord | null>(null);
  const { data, error, isLoading, refetch } = useBackupsQuery();
  const createBackup = useCreateBackupMutation();
  const restoreBackup = useRestoreBackupMutation();

  const handleCreateBackup = async () => {
    try {
      await createBackup.mutateAsync();
      toast({
        title: "Backup dibuat",
        description: "File backup tersimpan di server.",
        tone: "success",
      });
    } catch (reason) {
      toast({
        title: "Backup gagal dibuat",
        description: reason instanceof Error ? reason.message : "Coba lagi.",
        tone: "danger",
      });
    }
  };

  return (
    <RequirePermission permission="backup.create">
      <div className="flex flex-col gap-6">
        <PageHeader
          actions={
            <PermissionGate permission="backup.create">
              <Button
                isLoading={createBackup.isPending}
                onClick={handleCreateBackup}
              >
                <DatabaseBackup aria-hidden="true" className="h-4 w-4" />
                Buat backup
              </Button>
            </PermissionGate>
          }
          description="Cadangkan dan pulihkan data lokal."
          title="Backup"
        />

        <div className="rounded-lg border border-warning/30 bg-warning-subtle p-4 text-body text-warning-strong">
          Simpan salinan backup ke media terpisah. Backup di perangkat yang sama
          tidak melindungi dari kerusakan perangkat.
        </div>

        {isLoading ? (
          <Skeleton className="h-72" />
        ) : error ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : data ? (
          <Card>
            <CardHeader
              description={
                data[0]
                  ? `Backup terakhir ${formatDateTime(data[0].createdAt)}.`
                  : "Belum ada backup."
              }
              title="Daftar backup"
            />
            <CardContent className="p-0">
              {data.length === 0 ? (
                <p className="p-5 text-body text-muted-foreground">
                  Belum ada backup. Buat backup pertama untuk mulai.
                </p>
              ) : (
                <ResponsiveList
                  cards={data.map((backup) => (
                    <div
                      className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3"
                      key={backup.id}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="break-all text-body font-medium text-foreground">
                          {backup.fileName}
                        </span>
                        <Badge
                          tone={
                            backup.status === "READY"
                              ? "success"
                              : backup.status === "FAILED"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {backup.status === "READY"
                            ? "Siap"
                            : backup.status === "FAILED"
                              ? "Gagal"
                              : "Berjalan"}
                        </Badge>
                      </div>
                      <span className="text-caption text-muted-foreground">
                        {formatSize(backup.fileSize)}.{" "}
                        {formatDateTime(backup.createdAt)}
                      </span>
                      <span className="break-all text-caption text-muted-foreground">
                        Checksum {backup.checksum}
                      </span>
                      <PermissionGate permission="backup.restore">
                        <Button
                          onClick={() => setRestoreTarget(backup)}
                          size="sm"
                          variant="outline"
                        >
                          <RotateCcw aria-hidden="true" className="h-4 w-4" />
                          Restore
                        </Button>
                      </PermissionGate>
                    </div>
                  ))}
                  table={
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File</TableHead>
                          <TableHead>Ukuran</TableHead>
                          <TableHead>Waktu</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Checksum</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((backup) => (
                          <TableRow key={backup.id}>
                            <TableCell className="font-medium">
                              {backup.fileName}
                            </TableCell>
                            <TableCell className="tabular-nums text-muted-foreground">
                              {formatSize(backup.fileSize)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {formatDateTime(backup.createdAt)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                tone={
                                  backup.status === "READY"
                                    ? "success"
                                    : backup.status === "FAILED"
                                      ? "danger"
                                      : "warning"
                                }
                              >
                                {backup.status === "READY"
                                  ? "Siap"
                                  : backup.status === "FAILED"
                                    ? "Gagal"
                                    : "Berjalan"}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-40 truncate text-caption text-muted-foreground">
                              {backup.checksum}
                            </TableCell>
                            <TableCell className="text-right">
                              <PermissionGate permission="backup.restore">
                                <Button
                                  onClick={() => setRestoreTarget(backup)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <RotateCcw
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                  />
                                  Restore
                                </Button>
                              </PermissionGate>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  }
                />
              )}
            </CardContent>
          </Card>
        ) : null}

        <ConfirmDialog
          confirmLabel="Pulihkan data"
          consequence="Database saat ini akan diganti dengan isi backup. Server harus dimulai ulang setelah restore."
          description={
            restoreTarget
              ? `Pulihkan ${restoreTarget.fileName} dari ${formatDateTime(restoreTarget.createdAt)}?`
              : ""
          }
          isLoading={restoreBackup.isPending}
          onConfirm={async () => {
            if (!restoreTarget) {
              return;
            }
            try {
              await restoreBackup.mutateAsync(restoreTarget.id);
            } catch (reason) {
              toast({
                title: "Restore gagal",
                description:
                  reason instanceof Error ? reason.message : "Coba lagi.",
                tone: "danger",
              });
            }
          }}
          onOpenChange={(open) => {
            if (!open) {
              setRestoreTarget(null);
            }
          }}
          open={restoreTarget !== null}
          title="Pulihkan data dari backup?"
        />
      </div>
    </RequirePermission>
  );
}
