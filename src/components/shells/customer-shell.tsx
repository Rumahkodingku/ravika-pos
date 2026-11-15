import { MapPin, Store } from "lucide-react";
import { ShellTheme } from "@/components/shells/shell-theme";
import { mockOutlets } from "@/mocks/outlets";
import type { Outlet } from "@/types/auth";

export function CustomerShell({
  children,
  contextLabel,
  outlet = mockOutlets[0],
}: {
  children: React.ReactNode;
  contextLabel?: string;
  outlet?: Outlet;
}) {
  return (
    <ShellTheme defaultTheme="light">
      <div className="flex min-h-dvh flex-col bg-surface-subtle">
        <header className="border-b border-border bg-background">
          <div className="mx-auto flex w-full max-w-lg items-center gap-3 px-4 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-body font-semibold text-foreground">
                {outlet.name}
              </span>
              <span className="flex items-center gap-1 text-caption text-muted-foreground">
                <MapPin aria-hidden="true" className="h-3 w-3" />
                {contextLabel ?? outlet.city}
              </span>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-5">
          {children}
        </main>
        <footer className="border-t border-border bg-background py-4">
          <p className="mx-auto max-w-lg px-4 text-center text-caption text-muted-foreground">
            Pesanan diproses oleh staf RAVIKA.
          </p>
        </footer>
      </div>
    </ShellTheme>
  );
}
