import { KdsShell } from "@/components/shells/kds-shell";
import { RequireSession } from "@/features/auth/require-session";

export default function KdsLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession roles={["OWNER", "BARISTA"]} redirectTo="/app">
      <KdsShell>{children}</KdsShell>
    </RequireSession>
  );
}
