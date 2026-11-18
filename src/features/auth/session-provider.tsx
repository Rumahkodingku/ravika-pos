"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { SessionUser } from "@/types/auth";

const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: SessionUser;
}) {
  return (
    <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
  );
}

export function useSession(): { user: SessionUser } {
  const user = useContext(SessionContext);

  if (!user) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return { user };
}
