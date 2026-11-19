"use client";

import { AppHeader } from "@/components/shells/app-header";
import { ShellTheme } from "@/components/shells/shell-theme";
import { Container } from "@/components/ui/layout";
import { useSession } from "@/features/auth/session-provider";

export function ManagementShell({ children }: { children: React.ReactNode }) {
  const { user } = useSession();

  return (
    <ShellTheme defaultTheme="system">
      <div className="flex min-h-dvh flex-col bg-background">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-md focus:border focus:border-border focus:bg-surface focus:px-4 focus:py-2 focus:text-body focus:text-foreground"
          href="#main-content"
        >
          Lewati ke konten utama
        </a>

        <AppHeader />

        <main className="flex-1 py-6" id="main-content">
          <Container size="wide">{children}</Container>
        </main>

        <footer className="border-t border-border py-4">
          <Container size="wide">
            <p className="text-caption text-muted-foreground">
              RAVIKA POS. Sesi: {user.roleLabel}.
            </p>
          </Container>
        </footer>
      </div>
    </ShellTheme>
  );
}
