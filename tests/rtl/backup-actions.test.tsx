/** @vitest-environment jsdom */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BackupPage from "@/app/(dashboard)/app/backup/page";
import { RestartRequiredProvider } from "@/features/system/restart-required";
import type { SessionUser } from "@/types/auth";
import type { BackupRecord } from "@/types/domain";
import { renderWithProviders } from "../helpers/render";

const fetchMock = vi.fn();

const owner: SessionUser = {
  id: "user-owner",
  name: "Rina Pemilik",
  email: "owner@ravika.id",
  username: "owner",
  role: "OWNER",
  roleLabel: "Pemilik",
  permissions: ["backup.create", "backup.restore"],
};

const backup: BackupRecord = {
  id: "backup-1",
  fileName: "ravika-20261118-080000.sqlite",
  filePath: "/data/backups/ravika-20261118-080000.sqlite",
  fileSize: 4096,
  checksum: "a".repeat(64),
  status: "READY",
  createdBy: "user-owner",
  createdAt: new Date().toISOString(),
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderPage() {
  return renderWithProviders(
    <RestartRequiredProvider>
      <BackupPage />
    </RestartRequiredProvider>,
    { user: owner },
  );
}

describe("backup actions", () => {
  it("shows a warning when no backup exists", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    renderPage();

    expect(
      (await screen.findAllByText(/Belum ada backup. Buat backup pertama/))
        .length,
    ).toBeGreaterThan(0);
  });

  it("uploads a selected backup file", async () => {
    fetchMock.mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input) === "/api/backup" && !init?.method) {
          return jsonResponse([]);
        }

        if (String(input) === "/api/backup/upload" && init?.method === "POST") {
          return jsonResponse(backup, 201);
        }

        return jsonResponse({}, 404);
      },
    );

    const { container } = renderPage();
    const events = userEvent.setup();
    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    await events.upload(
      input,
      new File(["sqlite"], "backup.sqlite", {
        type: "application/octet-stream",
      }),
    );

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) =>
            String(url) === "/api/backup/upload" && init?.method === "POST",
        ),
      ).toBe(true);
    });
  });

  it("renders a download link for a ready backup", async () => {
    fetchMock.mockResolvedValue(jsonResponse([backup]));

    renderPage();

    const links = await screen.findAllByRole("link", { name: "Download" });

    expect(links[0]?.getAttribute("href")).toBe(
      "/api/backup/backup-1/download",
    );
  });
});
