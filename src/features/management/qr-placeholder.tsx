"use client";

import { Copy, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

const GRID_SIZE = 21;

function hash(value: string) {
  let result = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }

  return result >>> 0;
}

function finderValue(
  row: number,
  column: number,
  originRow: number,
  originColumn: number,
) {
  const localRow = row - originRow;
  const localColumn = column - originColumn;

  if (localRow < 0 || localRow > 6 || localColumn < 0 || localColumn > 6) {
    return null;
  }

  const border =
    localRow === 0 || localRow === 6 || localColumn === 0 || localColumn === 6;
  const center =
    localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4;

  return border || center;
}

function cellFilled(token: string, row: number, column: number) {
  const finder =
    finderValue(row, column, 0, 0) ??
    finderValue(row, column, 0, GRID_SIZE - 7) ??
    finderValue(row, column, GRID_SIZE - 7, 0);

  if (finder !== null) {
    return finder;
  }

  return hash(`${token}:${row}:${column}`) % 3 !== 0;
}

function QrPattern({ token }: { token: string }) {
  const cells = useMemo(
    () =>
      Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
        const row = Math.floor(index / GRID_SIZE);
        const column = index % GRID_SIZE;
        return { column, filled: cellFilled(token, row, column), row };
      }),
    [token],
  );

  return (
    <div
      aria-hidden="true"
      className="grid aspect-square w-full max-w-56 gap-px rounded-md border border-border bg-white p-2"
      style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
    >
      {cells.map((cell) => (
        <span
          className={cn(
            "rounded-[1px]",
            cell.filled ? "bg-neutral-900" : "bg-white",
          )}
          key={`${cell.row}-${cell.column}`}
        />
      ))}
    </div>
  );
}

export function QrPlaceholder({
  label,
  token,
}: {
  label: string;
  token: string;
}) {
  const { toast } = useToast();
  const [printOpen, setPrintOpen] = useState(false);
  const menuUrl = `http://ravika.local/menu/${token}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      toast({
        title: "Tautan contoh disalin",
        description: "Tautan ini belum aktif dan hanya untuk pratinjau.",
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
        <QrPattern token={token} />
        <div className="flex flex-col items-center gap-1 text-center">
          <Badge tone="warning">Pratinjau QR, belum scannable</Badge>
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
        description="Contoh cetak untuk meja. QR belum dapat dipindai."
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
          <QrPattern token={token} />
          <p className="text-card-title text-foreground">{label}</p>
          <p className="text-caption text-muted-foreground">
            Pratinjau QR, belum scannable.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
