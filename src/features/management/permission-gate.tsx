"use client";

import Link from "next/link";
import { PermissionDeniedState } from "@/components/feedback/permission-denied-state";
import { buttonVariants } from "@/components/ui/button";
import { useSession } from "@/features/auth/session-provider";

export function PermissionGate({
  children,
  fallback = null,
  permission,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  permission: string;
}) {
  const { user } = useSession();

  if (!user.permissions.includes(permission)) {
    return fallback;
  }

  return children;
}

export function RequirePermission({
  children,
  permission,
}: {
  children: React.ReactNode;
  permission: string;
}) {
  const { user } = useSession();

  if (!user.permissions.includes(permission)) {
    return (
      <PermissionDeniedState
        action={
          <Link className={buttonVariants({ variant: "outline" })} href="/app">
            Kembali ke dashboard
          </Link>
        }
      />
    );
  }

  return children;
}
