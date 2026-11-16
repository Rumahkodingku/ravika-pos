"use client";

import { HardDrive, Monitor, Wifi } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login belum tersedia",
        description:
          "Autentikasi nyata akan diimplementasikan pada fase backend.",
        tone: "info",
      });
    }, 600);
  };

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

      <div className="flex flex-col justify-center gap-6 p-6 sm:p-8">
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

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field htmlFor="login-identity" label="Email atau username">
            <Input
              autoComplete="username"
              id="login-identity"
              placeholder="nama@ravika.id"
              required
              type="text"
            />
          </Field>
          <Field htmlFor="login-password" label="Kata sandi">
            <Input
              autoComplete="current-password"
              id="login-password"
              placeholder="Masukkan kata sandi"
              required
              type="password"
            />
          </Field>
          <label
            className="flex min-h-11 items-center gap-2 text-body text-muted-foreground"
            htmlFor="remember-session"
          >
            <Checkbox id="remember-session" />
            Ingat sesi di perangkat ini
          </label>
          <Button className="w-full" isLoading={isLoading} type="submit">
            Masuk
          </Button>
          <p className="text-center text-caption text-muted-foreground">
            Form ini hanya simulasi UI. Tidak ada kredensial yang dikirim.
          </p>
        </form>
      </div>
    </div>
  );
}
