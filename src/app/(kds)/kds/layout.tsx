import { redirect } from "next/navigation";
import { KdsShell } from "@/components/shells/kds-shell";
import { landingPathForPermissions } from "@/features/auth/landing";
import { requireLayoutSession } from "@/features/auth/server-session";
import { SessionProvider } from "@/features/auth/session-provider";

export default async function KdsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireLayoutSession();

  if (!user.permissions.includes("kds.view")) {
    redirect(landingPathForPermissions(user.permissions));
  }

  return (
    <SessionProvider user={user}>
      <KdsShell>{children}</KdsShell>
    </SessionProvider>
  );
}
