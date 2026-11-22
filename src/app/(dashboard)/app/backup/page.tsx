"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DatabaseBackup, Download, RotateCcw, Upload } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { ResponsiveList } from "@/components/data-table/responsive-list";
import { TableActions } from "@/components/data-table/table-actions";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";
import {
  useBackupsQuery,
  useCreateBackupMutation,
  useRestoreBackupMutation,
  useUploadBackupMutation,
} from "@/features/management/api/system";
import {
  PermissionGate,
  RequirePermission,
} from "@/features/management/permission-gate";
import { useNow } from "@/features/operational/use-now";
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
  const uploadBackup = useUploadBackupMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const now = useNow();
  const lastBackup = data?.[0];
  const stale =
    lastBackup && now
      ? now.getTime() - new Date(lastBackup.createdAt).getTime() >
        24 * 60 * 60 * 1000
      : false;

  const handleUploadBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      await uploadBackup.mutateAsync(file);
      toast({
        title: "Backup diunggah",
        description: "File backup berhasil disimpan.",
        tone: "success",
      });
    } catch (reason) {
      toast({
        title: "Upload gagal",
        description: reason instanceof Error ? reason.message : "Coba lagi.",
        tone: "danger",
      });
    }
  };

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

  const columns: ColumnDef<BackupRecord>[] = [
    {
      accessorKey: "fileName",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.fileName}</span>
      ),
      header: "File",
    },
    {
      accessorKey: "fileSize",
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {formatSize(row.original.fileSize)}
        </span>
      ),
      header: "Ukuran",
    },
    {
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
      header: "Waktu",
    },
    {
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge
          tone={
            row.original.status === "READY"
              ? "success"
              : row.original.status === "FAILED"
                ? "danger"
                : "warning"
          }
        >
          {row.original.status === "READY"
            ? "Siap"
            : row.original.status === "FAILED"
              ? "Gagal"
              : "Berjalan"}
        </Badge>
      ),
      header: "Status",
    },
    {
      accessorKey: "checksum",
      cell: ({ row }) => (
        <span className="block max-w-40 truncate text-caption text-muted-foreground">
          {row.original.checksum}
        </span>
      ),
      header: "Checksum",
    },
    {
      cell: ({ row }) => {
        const backup = row.original;

        return (
          <div className="flex justify-end gap-1">
            {backup.status === "READY" ? (
              <Tooltip content="Download backup">
                <a
                  aria-label="Download backup"
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                  download
                  href={`/api/backup/${backup.id}/download`}
                >
                  <Download aria-hidden="true" className="h-4 w-4" />
                </a>
              </Tooltip>
            ) : null}
            <PermissionGate permission="backup.restore">
              <TableActions
                actions={[
                  {
                    icon: RotateCcw,
                    label: `Restore ${backup.fileName}`,
                    onClick: () => setRestoreTarget(backup),
                  },
                ]}
              />
            </PermissionGate>
          </div>
        );
      },
      header: "Aksi",
      id: "actions",
      meta: { cellClassName: "text-right", className: "text-right" },
    },
  ];

  return (
    <RequirePermission permission="backup.create">
      <div className="flex flex-col gap-6">
        <PageHeader
          actions={
            <>
              <PermissionGate permission="backup.restore">
                <Button
                  isLoading={uploadBackup.isPending}
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  <Upload aria-hidden="true" className="h-4 w-4" />
                  Unggah backup
                </Button>
                <input
                  accept=".sqlite"
                  className="sr-only"
                  onChange={handleUploadBackup}
                  ref={fileInputRef}
                  type="file"
                />
              </PermissionGate>
              <PermissionGate permission="backup.create">
                <Button
                  isLoading={createBackup.isPending}
                  onClick={handleCreateBackup}
                >
                  <DatabaseBackup aria-hidden="true" className="h-4 w-4" />
                  Buat backup
                </Button>
              </PermissionGate>
            </>
          }
          description="Cadangkan dan pulihkan data lokal."
          title="Backup"
        />

        <div className="rounded-lg border border-warning/30 bg-warning-subtle p-4 text-body text-warning-strong">
          Simpan salinan backup ke media terpisah. Backup di perangkat yang sama
          tidak melindungi dari kerusakan perangkat.
        </div>

        {data && (!lastBackup || stale) ? (
          <div className="rounded-lg border border-border bg-surface p-4 text-body text-foreground">
            {!lastBackup
              ? "Belum ada backup. Buat backup pertama sebelum data operasional bertambah."
              : "Backup terakhir lebih dari 24 jam. Buat backup baru atau periksa jadwal backup."}
          </div>
        ) : null}

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
                      <div className="flex flex-wrap gap-2">
                        {backup.status === "READY" ? (
                          <a
                            className={buttonVariants({
                              size: "sm",
                              variant: "outline",
                            })}
                            download
                            href={`/api/backup/${backup.id}/download`}
                          >
                            <Download aria-hidden="true" className="h-4 w-4" />
                            Download
                          </a>
                        ) : null}
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
                    </div>
                  ))}
                  table={
                    <DataTable
                      columns={columns}
                      data={data}
                      getRowId={(backup) => backup.id}
                    />
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
