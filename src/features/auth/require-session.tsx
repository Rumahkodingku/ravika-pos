"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingState } from "@/components/feedback/loading-state";
import {
  landingPathForRole,
  useMockSession,
} from "@/features/auth/mock-session";

export function RequireSession({
  children,
  redirectTo,
  roles,
}: {
  children: React.ReactNode;
  redirectTo?: string;
  roles?: string[];
}) {
  const { isReady, user } = useMockSession();
  const router = useRouter();
  const roleAllowed = !roles || (user ? roles.includes(user.role) : false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (roles && !roles.includes(user.role)) {
      router.replace(redirectTo ?? landingPathForRole(user.role));
    }
  }, [isReady, redirectTo, roles, router, user]);

  if (!isReady || !user || !roleAllowed) {
    return (
      <LoadingState className="min-h-dvh" message="Memeriksa sesi demo..." />
    );
  }

  return children;
}
