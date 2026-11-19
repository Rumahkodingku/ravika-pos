"use client";

import { Copy, Network, QrCode, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { RequirePermission } from "@/features/management/permission-gate";
import {
  useNetworkStatusQuery,
  usePreferredInterfaceMutation,
} from "@/features/system/api/network";
import { formatDateTime } from "@/lib/format";
import type { NetworkAddress } from "@/types/network";

function statusTone(status: "available" | "no-lan" | "error") {
  return status === "available"
    ? "success"
    : status === "no-lan"
      ? "warning"
      : "danger";
}

function mdnsLabel(
  status: "published" | "disabled" | "degraded" | "error",
  enabled: boolean,
) {
  if (!enabled) {
    return "Nonaktif";
  }
  if (status === "published") {
    return "Aktif";
  }
  return status === "degraded" ? "Terbatas" : "Gagal";
}

function addressLabel(address: NetworkAddress) {
  return `${address.interfaceName} ${address.address}`;
}

export default function NetworkSettingsPage() {
  const { toast } = useToast();
  const { data, error, isLoading, refetch } = useNetworkStatusQuery();
  const preferred = usePreferredInterfaceMutation();
  const [showQr, setShowQr] = useState(false);

  const copyUrl = async () => {
    if (!data?.preferredAccess.url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(data.preferredAccess.url);
      toast({
        title: "Alamat disalin",
        description: "Buka alamat ini dari perangkat di jaringan yang sama.",
        tone: "success",
      });
    } catch {
      toast({
        title: "Alamat gagal disalin",
        description: `Salin manual: ${data.preferredAccess.url}`,
        tone: "danger",
      });
    }
  };

  const chooseInterface = async (address: NetworkAddress) => {
    try {
      await preferred.mutateAsync(address.interfaceId);
      toast({ title: "Jaringan utama dipilih", tone: "success" });
    } catch (reason) {
      toast({
        title: "Gagal memilih jaringan",
        description: reason instanceof Error ? reason.message : "Coba lagi.",
        tone: "danger",
      });
    }
  };

  return (
    <RequirePermission permission="settings.manage">
      <div className="flex flex-col gap-6">
        <PageHeader
          description="Alamat LAN dan status koneksi server."
          title="Jaringan"
        />

        {isLoading ? (
          <Skeleton className="h-80" />
        ) : error ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : data ? (
          <>
            <Card>
              <CardHeader
                action={
                  <Badge tone={statusTone(data.status)}>
                    {data.status === "available"
                      ? "Tersedia"
                      : data.status === "no-lan"
                        ? "Tidak ada LAN"
                        : "Gagal"}
                  </Badge>
                }
                description={`Diperbarui ${formatDateTime(data.updatedAt)}.`}
                title="Status jaringan"
              />
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-caption text-muted-foreground">
                    Alamat akses
                  </span>
                  <span className="break-all text-card-title text-foreground">
                    {data.preferredAccess.url ?? "Belum ada alamat LAN."}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    disabled={!data.preferredAccess.url}
                    onClick={copyUrl}
                    size="sm"
                    variant="outline"
                  >
                    <Copy aria-hidden="true" className="h-4 w-4" />
                    Salin alamat
                  </Button>
                  <Button
                    disabled={!data.preferredAccess.url}
                    onClick={() => setShowQr((open) => !open)}
                    size="sm"
                    variant="outline"
                  >
                    <QrCode aria-hidden="true" className="h-4 w-4" />
                    {showQr ? "Sembunyikan QR" : "Tampilkan QR"}
                  </Button>
                  <Button
                    onClick={() => void refetch()}
                    size="sm"
                    variant="outline"
                  >
                    <RefreshCw aria-hidden="true" className="h-4 w-4" />
                    Perbarui
                  </Button>
                </div>
                {showQr && data.preferredAccess.url ? (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface-subtle p-4">
                    <div className="rounded-md bg-white p-3">
                      <QRCodeSVG
                        bgColor="#ffffff"
                        fgColor="#101828"
                        level="M"
                        marginSize={2}
                        size={192}
                        title="QR akses RAVIKA POS"
                        value={data.preferredAccess.url}
                      />
                    </div>
                    <p className="text-caption text-muted-foreground">
                      Perangkat harus terhubung ke jaringan yang sama.
                    </p>
                  </div>
                ) : null}
                <dl className="grid gap-3 text-body sm:grid-cols-3">
                  <div>
                    <dt className="text-caption text-muted-foreground">Port</dt>
                    <dd className="font-medium text-foreground">
                      {data.server.port}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-caption text-muted-foreground">mDNS</dt>
                    <dd className="font-medium text-foreground">
                      {mdnsLabel(data.mdns.status, data.mdns.enabled)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-caption text-muted-foreground">
                      Hostname
                    </dt>
                    <dd className="font-medium text-foreground">
                      {data.mdns.hostname}
                    </dd>
                  </div>
                </dl>
                {data.mdns.status !== "published" && data.mdns.enabled ? (
                  <p className="rounded-md border border-warning/30 bg-warning-subtle px-3 py-2 text-body text-warning-strong">
                    {data.mdns.message ??
                      "mDNS tidak tersedia. Gunakan alamat IP."}
                  </p>
                ) : null}
                {data.mdns.message && data.mdns.status === "published" ? (
                  <p className="rounded-md border border-border bg-surface px-3 py-2 text-body text-muted-foreground">
                    {data.mdns.message}
                  </p>
                ) : null}
                {data.preferredInterfaceId &&
                !data.addresses.some(
                  (address) =>
                    address.interfaceId === data.preferredInterfaceId,
                ) ? (
                  <p className="rounded-md border border-warning/30 bg-warning-subtle px-3 py-2 text-body text-warning-strong">
                    Interface utama sedang tidak tersedia. Server memakai
                    interface pengganti.
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                description="Pilih interface yang dipakai perangkat lain untuk mengakses server."
                title="Interface jaringan"
              />
              <CardContent className="flex flex-col gap-3">
                {data.addresses.length === 0 ? (
                  <p className="text-body text-muted-foreground">
                    Belum ada jaringan LAN yang dapat dipakai.
                  </p>
                ) : (
                  data.addresses.map((address) => (
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-3"
                      key={address.interfaceId}
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="flex items-center gap-2 font-medium text-foreground">
                          <Network aria-hidden="true" className="h-4 w-4" />
                          {addressLabel(address)}
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {address.description}
                          {address.gateway
                            ? `, gateway ${address.gateway}`
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {address.preferred ? (
                          <Badge tone="success">Utama</Badge>
                        ) : (
                          <Button
                            isLoading={preferred.isPending}
                            onClick={() => void chooseInterface(address)}
                            size="sm"
                            variant="outline"
                          >
                            Pilih
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {data.excluded.length > 0 ? (
                  <details className="text-caption text-muted-foreground">
                    <summary className="cursor-pointer font-medium text-foreground">
                      Interface yang tidak dipakai
                    </summary>
                    <ul className="mt-2 flex flex-col gap-1">
                      {data.excluded.map((entry) => (
                        <li key={`${entry.interfaceName}-${entry.address}`}>
                          {entry.interfaceName} {entry.address}: {entry.reason}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </RequirePermission>
  );
}
