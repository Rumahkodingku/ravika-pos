import Link from "next/link";
import { ShellTheme } from "@/components/shells/shell-theme";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Container } from "@/components/ui/layout";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellTheme defaultTheme="system">
      <div className="flex min-h-dvh flex-col bg-surface-subtle">
        <header className="border-b border-border bg-surface">
          <Container size="wide">
            <div className="flex h-16 items-center justify-between">
              <Link
                className="flex items-baseline gap-1.5 rounded-md py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                href="/login"
              >
                <span className="text-lg font-bold tracking-tight text-foreground">
                  RAVIKA
                </span>
                <span className="text-caption font-semibold text-primary-strong">
                  POS
                </span>
              </Link>
              <ThemeToggle />
            </div>
          </Container>
        </header>
        <main className="flex flex-1 items-center justify-center px-4 py-10">
          {children}
        </main>
        <footer className="py-4">
          <Container size="wide">
            <p className="text-caption text-muted-foreground">
              RAVIKA POS. Run your business with clarity.
            </p>
          </Container>
        </footer>
      </div>
    </ShellTheme>
  );
}
