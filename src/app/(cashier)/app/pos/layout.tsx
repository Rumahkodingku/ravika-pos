import { redirect } from "next/navigation";
import { PosShell } from "@/components/shells/pos-shell";
import { landingPathForPermissions } from "@/features/auth/landing";
import { requireLayoutSession } from "@/features/auth/server-session";
import { SessionProvider } from "@/features/auth/session-provider";

export default async function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireLayoutSession();
  const canOperatePos =
    user.permissions.includes("orders.create") ||
    user.permissions.includes("payments.view");

  if (!canOperatePos) {
    redirect(landingPathForPermissions(user.permissions));
  }

  return (
    <SessionProvider user={user}>
      <PosShell>{children}</PosShell>
    </SessionProvider>
  );
}
