"use client";

import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden lg:block"
      >
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&h=900&q=80"
        />
        <div className="absolute inset-0 bg-black/60" />
      </aside>

      <section className="relative flex min-h-dvh flex-col bg-surface">
        <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-start gap-8 px-6 py-16 sm:px-8 lg:justify-center">
          <div className="flex items-center gap-2 lg:hidden">
            <BrandLogo size="md" />
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
