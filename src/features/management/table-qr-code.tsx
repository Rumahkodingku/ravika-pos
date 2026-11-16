"use client";

import { Copy, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function TableQrCode({
  label,
  token,
}: {
  label: string;
  token: string;
}) {
  const { toast } = useToast();
  const [origin, setOrigin] = useState("");
  const [printOpen, setPrintOpen] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const menuUrl = `${origin || ""}/menu/${token}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      toast({
        title: "Tautan menu disalin",
        description: "Buka tautan ini di browser pelanggan.",
        tone: "success",
      });
    } catch {
      toast({
        title: "Tautan gagal disalin",
        description: `Salin manual: ${menuUrl}`,
        tone: "danger",
      });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface-subtle p-4">
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
        <div className="flex flex-col items-center gap-1 text-center">
          <Badge tone="success">QR meja siap dipindai</Badge>
          <p className="text-body font-medium text-foreground">{label}</p>
          <p className="max-w-xs break-all text-caption text-muted-foreground">
            {menuUrl}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={copyLink} size="sm" variant="outline">
          <Copy aria-hidden="true" className="h-4 w-4" />
          Salin tautan
        </Button>
        <Button onClick={() => setPrintOpen(true)} size="sm" variant="outline">
          <Printer aria-hidden="true" className="h-4 w-4" />
          Pratinjau cetak
        </Button>
      </div>

      {/* shortcut: prints the whole page until a print stylesheet exists. */}
      <Dialog
        description="Cetak QR ini dan letakkan di meja pelanggan."
        footer={
          <Button onClick={() => window.print()} variant="outline">
            <Printer aria-hidden="true" className="h-4 w-4" />
            Cetak
          </Button>
        }
        onOpenChange={setPrintOpen}
        open={printOpen}
        title="Pratinjau cetak QR"
      >
        <div className="flex flex-col items-center gap-3">
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
      </Dialog>
    </div>
  );
}
