import { PosShell } from "@/components/shells/pos-shell";
import { RequireSession } from "@/features/auth/require-session";

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession roles={["OWNER", "CASHIER"]} redirectTo="/kds">
      <PosShell>{children}</PosShell>
    </RequireSession>
  );
}
