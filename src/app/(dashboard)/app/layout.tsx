import { ManagementShell } from "@/components/shells/management-shell";
import { requireLayoutSession } from "@/features/auth/server-session";
import { SessionProvider } from "@/features/auth/session-provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireLayoutSession();

  return (
    <SessionProvider user={user}>
      <ManagementShell>{children}</ManagementShell>
    </SessionProvider>
  );
}
