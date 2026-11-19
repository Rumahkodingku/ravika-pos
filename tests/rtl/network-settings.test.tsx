/** @vitest-environment jsdom */

import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NetworkSettingsPage from "@/app/(dashboard)/app/settings/network/page";
import type { SessionUser } from "@/types/auth";
import type { NetworkStatus } from "@/types/network";
import { renderWithProviders } from "../helpers/render";

const fetchMock = vi.fn();

const owner: SessionUser = {
  id: "user-owner",
  name: "Rina Pemilik",
  email: "owner@ravika.id",
  username: "owner",
  role: "OWNER",
  roleLabel: "Pemilik",
  permissions: ["settings.manage"],
};

const status: NetworkStatus = {
  addresses: [
    {
      address: "192.168.1.20",
      description: "Wi-Fi adapter",
      family: "IPv4",
      gateway: "192.168.1.1",
      interfaceId: "wifi-guid",
      interfaceName: "Wi-Fi",
      netmask: "255.255.255.0",
      preferred: true,
      advertised: true,
      status: "available",
      virtual: false,
    },
  ],
  excluded: [],
  mdns: { enabled: true, hostname: "ravika-pos.local", status: "published" },
  preferredAccess: { type: "mdns", url: "http://ravika-pos.local:3000" },
  preferredInterfaceId: "wifi-guid",
  server: { listening: true, port: 3000 },
  status: "available",
  updatedAt: "2026-11-19T10:00:00.000Z",
};

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("network settings", () => {
  it("shows the preferred access URL and adapter", async () => {
    fetchMock.mockResolvedValue(jsonResponse(status));

    renderWithProviders(<NetworkSettingsPage />, { user: owner });

    expect(
      await screen.findByText("http://ravika-pos.local:3000"),
    ).toBeDefined();
    expect(screen.getByText("Wi-Fi 192.168.1.20")).toBeDefined();
    expect(screen.getByText("Aktif")).toBeDefined();
  });
});
