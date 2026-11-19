"use client";

import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useLanUrlQuery } from "@/features/system/api/network";

export function TableQrCode({
  label,
  token,
}: {
  label: string;
  token: string;
}) {
  const [printOpen, setPrintOpen] = useState(false);
  const lanUrl = useLanUrlQuery();
  const menuUrl = lanUrl.data?.url ? `${lanUrl.data.url}/menu/${token}` : "";
  const ready = Boolean(menuUrl);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface-subtle p-4">
        {ready ? (
          <div className="rounded-md bg-white p-3">
            <QRCodeSVG
              bgColor="#ffffff"
              fgColor="#101828"
              level="M"
              marginSize={2}
              size={192}
              title={`QR meja ${label}`}
              value={menuUrl}
            />
          </div>
        ) : (
          <div className="flex min-h-[216px] w-[216px] items-center justify-center rounded-md border border-dashed border-border bg-surface p-4 text-center text-caption text-muted-foreground">
            {lanUrl.isPending
              ? "Menyiapkan QR meja."
              : "URL LAN belum tersedia. Atur jaringan di halaman Pengaturan."}
          </div>
        )}
        <div className="flex flex-col items-center gap-1 text-center">
          <Badge tone={ready ? "success" : "warning"}>
            {ready ? "QR meja siap dipindai" : "QR meja belum siap"}
          </Badge>
          <p className="text-body font-medium text-foreground">{label}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={!ready}
          onClick={() => setPrintOpen(true)}
          size="sm"
          variant="outline"
        >
          <Printer aria-hidden="true" className="h-4 w-4" />
          Pratinjau cetak
        </Button>
      </div>

      <Dialog
        description="Cetak QR ini dan letakkan di meja pelanggan."
        footer={
          <Button
            disabled={!ready}
            onClick={() => window.print()}
            variant="outline"
          >
            <Printer aria-hidden="true" className="h-4 w-4" />
            Cetak
          </Button>
        }
        onOpenChange={setPrintOpen}
        open={printOpen}
        title="Pratinjau cetak QR"
      >
        {ready ? (
          <div className="print-qr flex flex-col items-center gap-3">
            <div className="rounded-md bg-white p-3">
              <QRCodeSVG
                bgColor="#ffffff"
                fgColor="#101828"
                level="M"
                marginSize={2}
                size={220}
                title={`QR meja ${label}`}
                value={menuUrl}
              />
            </div>
            <p className="text-card-title text-foreground">{label}</p>
            <p className="text-caption text-muted-foreground">
              Pindai untuk membuka menu pelanggan.
            </p>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
