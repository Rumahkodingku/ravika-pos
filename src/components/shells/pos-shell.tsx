"use client";

import { LogOut, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ConnectionIndicator } from "@/components/feedback/connection-indicator";
import { EmptyState } from "@/components/feedback/empty-state";
import { ShellTheme } from "@/components/shells/shell-theme";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { mockOutlets } from "@/mocks/outlets";
import { mockUsers } from "@/mocks/session";
import type { Outlet, SessionUser } from "@/types/auth";

function CartPreview() {
  return (
    <EmptyState
      description="Pilih produk untuk mulai membuat pesanan."
      icon={ShoppingCart}
      title="Keranjang masih kosong"
    />
  );
}

export function PosShell({
  cashier = mockUsers[1],
  children,
  outlet = mockOutlets[0],
}: {
  cashier?: SessionUser;
  children: React.ReactNode;
  outlet?: Outlet;
}) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <ShellTheme defaultTheme="light">
      <div className="flex min-h-dvh flex-col bg-background">
        <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-background/95 backdrop-blur">
          <div className="flex min-h-16 flex-wrap items-center gap-3 px-4 py-2 sm:px-6">
            <Link
              className="flex shrink-0 items-baseline gap-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              href="/app/pos"
            >
              <span className="text-lg font-bold tracking-tight text-foreground">
                RAVIKA
              </span>
              <span className="text-caption font-semibold text-primary">
                POS
              </span>
            </Link>
            <div className="hidden min-w-0 flex-col sm:flex">
              <span className="truncate text-label font-medium text-foreground">
                {outlet.name}
              </span>
              <span className="truncate text-caption text-muted-foreground">
                Kasir: {cashier.name}
              </span>
            </div>
            <ConnectionIndicator className="ml-auto" status="connected" />
            <ThemeToggle />
            <Button
              className="lg:hidden"
              onClick={() => setCartOpen(true)}
              size="md"
              variant="outline"
            >
              <ShoppingCart aria-hidden="true" className="h-4 w-4" />
              Keranjang
            </Button>
            <Link
              className={buttonVariants({ variant: "outline", size: "sm" })}
              href="/app"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar POS</span>
            </Link>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
          <aside className="hidden w-80 shrink-0 border-l border-border bg-surface-subtle p-4 lg:block xl:w-96">
            <div className="sticky top-24 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-section-title text-foreground">Pesanan</h2>
                <span className="text-caption text-muted-foreground">
                  0 item
                </span>
              </div>
              <CartPreview />
            </div>
          </aside>
        </div>

        <Drawer
          footer={
            <Button disabled className="w-full">
              Lanjut ke pembayaran
            </Button>
          }
          onOpenChange={setCartOpen}
          open={cartOpen}
          side="right"
          title="Keranjang"
        >
          <CartPreview />
        </Drawer>
      </div>
    </ShellTheme>
  );
}
