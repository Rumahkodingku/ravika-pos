import { ThemeProvider, ThemeScript } from "@/components/theme/theme-provider";
import type { ThemeMode } from "@/types/ui";

export function ShellTheme({
  children,
  defaultTheme,
}: {
  children: React.ReactNode;
  defaultTheme: ThemeMode;
}) {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <ThemeScript defaultTheme={defaultTheme} />
      {children}
    </ThemeProvider>
  );
}
