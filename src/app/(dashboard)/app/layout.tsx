import { ManagementShell } from "@/components/shells/management-shell";
import { RequireSession } from "@/features/auth/require-session";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession roles={["OWNER", "CASHIER"]}>
      <ManagementShell>{children}</ManagementShell>
    </RequireSession>
  );
}
