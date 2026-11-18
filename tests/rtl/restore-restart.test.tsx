/** @vitest-environment jsdom */

import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
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
  createdAt: "2026-11-18T08:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

function stubReload() {
  const reload = vi.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { reload },
  });
  return reload;
}

function backupReads() {
  return fetchMock.mock.calls.filter(
    ([url, init]) => String(url) === "/api/backup" && !init?.method,
  ).length;
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close() {
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
});

beforeEach(() => {
  window.localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function renderBackupPage() {
  return renderWithProviders(
    <RestartRequiredProvider>
      <BackupPage />
    </RestartRequiredProvider>,
    { user: owner },
  );
}

async function openRestoreDialog() {
  const events = userEvent.setup();
  renderBackupPage();

  const restoreButtons = await screen.findAllByRole("button", {
    name: "Restore",
  });
  await events.click(restoreButtons[0]);
  await events.click(screen.getByRole("button", { name: "Pulihkan data" }));

  return events;
}

describe("restore restart screen", () => {
  it("blocks the app and reloads once health returns", async () => {
    const reload = stubReload();
    let healthReads = 0;
    let resolveHealth: (response: Response) => void = () => {};

    fetchMock.mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url === "/api/backup" && !init?.method) {
          return jsonResponse([backup]);
        }

        if (url === "/api/backup/restore" && init?.method === "POST") {
          return jsonResponse({ restored: true, restartRequired: true });
        }

        if (url === "/api/health") {
          healthReads += 1;
          return new Promise<Response>((resolve) => {
            resolveHealth = resolve;
          });
        }

        return jsonResponse({}, 404);
      },
    );

    await openRestoreDialog();

    await waitFor(() => {
      expect(screen.getByText("Restart diperlukan")).toBeDefined();
    });
    expect(screen.queryByRole("button", { name: "Buat backup" })).toBeNull();
    expect(window.localStorage.getItem("ravika-restart-required")).toBe("1");
    expect(backupReads()).toBe(1);
    expect(healthReads).toBe(1);
    expect(reload).not.toHaveBeenCalled();

    const healthCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/health",
    );

    expect(healthCall?.[1]).toEqual({ cache: "no-store" });

    await act(async () => {
      resolveHealth(jsonResponse({ status: "ok" }));
    });

    await waitFor(() => {
      expect(reload).toHaveBeenCalledTimes(1);
    });
    expect(window.localStorage.getItem("ravika-restart-required")).toBeNull();
  });

  it("polls health every three seconds until the server answers", async () => {
    vi.useFakeTimers();
    const reload = stubReload();
    window.localStorage.setItem("ravika-restart-required", "1");
    let healthReads = 0;

    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/health") {
        healthReads += 1;
        return jsonResponse({ status: "ok" }, healthReads === 1 ? 503 : 200);
      }

      return jsonResponse({}, 404);
    });

    renderWithProviders(
      <RestartRequiredProvider>
        <p>Aplikasi</p>
      </RestartRequiredProvider>,
      { user: owner },
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(screen.getByText("Restart diperlukan")).toBeDefined();
    expect(healthReads).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2999);
    });
    expect(healthReads).toBe(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(healthReads).toBe(2);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem("ravika-restart-required")).toBeNull();
  });

  it("does not block the app when restore fails", async () => {
    stubReload();
    fetchMock.mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url === "/api/backup" && !init?.method) {
          return jsonResponse([backup]);
        }

        if (url === "/api/backup/restore" && init?.method === "POST") {
          return jsonResponse(
            { code: "RESTORE_FAILED", detail: "Restore gagal." },
            500,
          );
        }

        return jsonResponse({}, 404);
      },
    );

    await openRestoreDialog();

    expect(await screen.findByText("Restore gagal")).toBeDefined();
    expect(screen.queryByText("Restart diperlukan")).toBeNull();
    expect(screen.getByRole("button", { name: "Buat backup" })).toBeDefined();
    expect(window.localStorage.getItem("ravika-restart-required")).toBeNull();
  });
});
