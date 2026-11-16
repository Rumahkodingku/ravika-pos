import { ShellTheme } from "@/components/shells/shell-theme";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellTheme defaultTheme="system">
      <main className="min-h-dvh bg-surface">{children}</main>
    </ShellTheme>
  );
}
