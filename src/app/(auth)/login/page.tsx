"use client";

import { HardDrive, Monitor, Wifi } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
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
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="hidden flex-col justify-between gap-10 border-r border-border bg-surface-inverse p-10 text-inverse-foreground lg:flex xl:p-14">
        <div className="flex flex-col gap-10">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">RAVIKA</span>
            <span className="text-caption font-semibold text-inverse-foreground/70">
              POS
            </span>
          </div>
          <div className="flex max-w-xl flex-col gap-3">
            <p className="text-display">Run your business with clarity.</p>
            <p className="max-w-md text-body text-inverse-foreground/75">
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
          Sistem operasional kafe dalam satu tempat.
        </p>
      </aside>

      <section className="relative flex min-h-dvh flex-col bg-surface">
        <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-start gap-8 px-6 py-16 sm:px-8 lg:justify-center">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="text-xl font-bold tracking-tight text-foreground">
              RAVIKA
            </span>
            <span className="text-caption font-semibold text-primary-strong">
              POS
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-section-title text-foreground">
              Masuk ke RAVIKA POS
            </h1>
            <p className="text-body text-muted-foreground">
              Masuk untuk mengelola operasional bisnis.
            </p>
          </div>

          <LoginForm />
        </div>
      </section>
    </div>
  );
}
