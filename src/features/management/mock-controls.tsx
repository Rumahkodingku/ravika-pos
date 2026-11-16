"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import {
  failNextRequest,
  getLatency,
  resetControls,
  setLatency,
} from "@/mocks/management/controls";
import { reset } from "@/mocks/management/store";

export function MockControls() {
  const { toast } = useToast();
  const [latency, setLatencyState] = useState(getLatency());

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="info">Alat QA internal</Badge>
        <p className="text-caption text-muted-foreground">
          Kontrol ini hanya ada di halaman design system.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
        <Field htmlFor="mock-latency" label="Latensi mock service">
          <Select
            id="mock-latency"
            onChange={(event) => {
              const next = Number(event.target.value);
              setLatency(next);
              setLatencyState(next);
            }}
            value={latency}
          >
            <option value={0}>Tanpa latensi</option>
            <option value={450}>Normal, 450 ms</option>
            <option value={800}>Lambat, 800 ms</option>
          </Select>
        </Field>
        <Button
          onClick={() => {
            failNextRequest();
            toast({
              title: "Permintaan berikutnya akan gagal",
              description: "Muat ulang data untuk melihat error state.",
              tone: "info",
            });
          }}
          variant="outline"
        >
          <TriangleAlert aria-hidden="true" className="h-4 w-4" />
          Gagalkan berikutnya
        </Button>
        <Button
          onClick={() => {
            reset();
            resetControls();
            setLatencyState(getLatency());
            toast({
              title: "Data mock direset",
              description: "Seed awal dimuat kembali.",
              tone: "success",
            });
          }}
          variant="outline"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Reset data
        </Button>
      </div>
    </div>
  );
}
