"use client";

import { HardDrive, Monitor, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoginForm } from "@/features/auth/login-form";

const productFacts = [
  {
    icon: Monitor,
    text: "Kasir, KDS, dan QR menu dalam satu alur.",
  },
  {
    icon: Wifi,
    text: "Berjalan di jaringan lokal tanpa internet wajib.",
  },
  {
    icon: HardDrive,
    text: "Data operasional tetap di komputer server Anda.",
  },
];

export default function LoginPage() {
  return (
    <div className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-surface shadow-overlay lg:grid-cols-[1fr_1fr]">
      <aside className="hidden flex-col justify-between gap-10 bg-surface-inverse p-8 text-inverse-foreground lg:flex">
        <div className="flex flex-col gap-8">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">RAVIKA</span>
            <span className="text-caption font-semibold text-inverse-foreground/70">
              POS
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-display">Run your business with clarity.</p>
            <p className="max-w-sm text-body text-inverse-foreground/70">
              Satu alur untuk pesanan, pembayaran, persiapan, dan laporan
              operasional kafe.
            </p>
          </div>
          <ul className="flex flex-col gap-4">
            {productFacts.map((fact) => {
              const Icon = fact.icon;

              return (
                <li className="flex items-start gap-3" key={fact.text}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/5">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span className="text-body text-inverse-foreground/80">
                    {fact.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="text-caption text-inverse-foreground/60">
          Mode UI dengan data simulasi.
        </p>
      </aside>

      <div className="flex min-w-0 flex-col justify-center gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-section-title text-foreground">
              Masuk ke RAVIKA POS
            </h1>
            <Badge tone="neutral">Mode UI</Badge>
          </div>
          <p className="text-body text-muted-foreground">
            Masuk untuk mengelola operasional bisnis.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
