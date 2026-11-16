"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useManagementStore } from "@/mocks/management/hooks";
import { mockUsers } from "@/mocks/session";
import type { SessionUser, UserRole } from "@/types/auth";

const SESSION_KEY = "ravika-session-user-id";
const DEMO_PASSWORD = "demo123";

type MockSessionContextValue = {
  user: SessionUser | null;
  isReady: boolean;
  login: (identity: string, password: string) => boolean;
  logout: () => void;
};

const MockSessionContext = createContext<MockSessionContextValue | null>(null);

export function landingPathForRole(role: UserRole) {
  if (role === "CASHIER") {
    return "/app/pos";
  }
  if (role === "BARISTA") {
    return "/kds";
  }
  return "/app";
}

export function MockSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const roles = useManagementStore((state) => state.roles);

  useEffect(() => {
    setUserId(window.sessionStorage.getItem(SESSION_KEY));
    setIsReady(true);
  }, []);

  const login = useCallback((identity: string, password: string) => {
    const normalized = identity.trim().toLowerCase();
    const match = mockUsers.find(
      (user) =>
        user.email.toLowerCase() === normalized ||
        user.username.toLowerCase() === normalized,
    );

    if (!match || password !== DEMO_PASSWORD) {
      return false;
    }

    window.sessionStorage.setItem(SESSION_KEY, match.id);
    setUserId(match.id);
    return true;
  }, []);

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setUserId(null);
  }, []);

  const baseUser = mockUsers.find((user) => user.id === userId) ?? null;
  const user = useMemo(() => {
    if (!baseUser) {
      return null;
    }

    const role = roles.find((candidate) => candidate.code === baseUser.role);

    return role ? { ...baseUser, permissions: role.permissionCodes } : baseUser;
  }, [baseUser, roles]);

  const value = useMemo(
    () => ({ user, isReady, login, logout }),
    [isReady, login, logout, user],
  );

  return (
    <MockSessionContext.Provider value={value}>
      {children}
    </MockSessionContext.Provider>
  );
}

export function useMockSession() {
  const context = useContext(MockSessionContext);

  if (!context) {
    throw new Error("useMockSession must be used within MockSessionProvider");
  }

  return context;
}
