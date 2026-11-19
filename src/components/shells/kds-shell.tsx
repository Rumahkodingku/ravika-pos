"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ConnectionIndicator } from "@/components/feedback/connection-indicator";
import { AppHeader } from "@/components/shells/app-header";
import { ShellTheme } from "@/components/shells/shell-theme";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { useLogoutMutation } from "@/features/auth/api";
import { useSession } from "@/features/auth/session-provider";
import { useKdsEvents } from "@/features/kds/use-kds-events";
import { hasManagementAccess } from "@/lib/navigation";

export function KdsShell({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const { mutate: logout } = useLogoutMutation();
  const { status } = useKdsEvents();
  const showManagementHeader = hasManagementAccess(user.permissions);

  return (
    <ShellTheme defaultTheme="dark">
      <div className="flex min-h-dvh flex-col bg-background">
        {showManagementHeader ? (
          <AppHeader
            actions={<ConnectionIndicator status={status} />}
            fullWidth
            invertLogo
            logoutLabel="Keluar KDS"
            moduleLabel="KDS"
          />
        ) : (
          <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-surface">
            <div className="flex min-h-[var(--ravika-header-height)] flex-wrap items-center gap-3 px-4 py-2 sm:px-6">
              <Link
                className="flex min-h-11 shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                href="/kds"
              >
                <BrandLogo className="brightness-0 invert" size="md" />
                <span className="flex flex-col leading-tight">
                  <span className="text-label font-semibold text-foreground">
                    RAVIKA KDS
                  </span>
                  <span className="text-caption text-muted-foreground">
                    Kitchen Display
                  </span>
                </span>
              </Link>
              <ConnectionIndicator className="ml-auto" status={status} />
              <ThemeToggle />
              <Button
                aria-label="Keluar KDS"
                onClick={() => {
                  logout();
                }}
                variant="outline"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar KDS</span>
              </Button>
            </div>
          </header>
        )}
        <main className="min-h-0 flex-1 overflow-x-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </ShellTheme>
  );
}
