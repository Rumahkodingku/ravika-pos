/** @vitest-environment jsdom */

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppHeader } from "@/components/shells/app-header";
import type { SessionUser } from "@/types/auth";
import { renderWithProviders } from "../helpers/render";

vi.mock("next/navigation", () => ({
  usePathname: () => "/app/pos",
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/components/theme/theme-toggle", () => ({
  ThemeToggle: () => null,
}));

const owner: SessionUser = {
  id: "user-owner",
  name: "Rina Pemilik",
  email: "owner@ravika.id",
  username: "owner",
  role: "OWNER",
  roleLabel: "Pemilik",
  permissions: [
    "dashboard.view",
    "orders.view",
    "orders.create",
    "reports.view",
    "users.view",
    "settings.manage",
  ],
};

describe("AppHeader", () => {
  it("renders management navigation", () => {
    renderWithProviders(<AppHeader />, { user: owner });

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeDefined();
    expect(screen.getByRole("button", { name: /Menu Lainnya/ })).toBeDefined();
    expect(screen.getByRole("button", { name: "Buka navigasi" })).toBeDefined();
    expect(screen.getByText("Rina Pemilik")).toBeDefined();
  });
});
