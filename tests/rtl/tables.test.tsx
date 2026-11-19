/** @vitest-environment jsdom */

import { screen, waitFor } from "@testing-library/react";
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
import TablesPage from "@/app/(dashboard)/app/tables/page";
import type { SessionUser } from "@/types/auth";
import type { DiningTable, TableSummary } from "@/types/domain";
import { renderWithProviders } from "../helpers/render";

vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ title, value }: { title?: string; value: string }) => (
    <svg data-testid="table-qr" data-value={value}>
      <title>{title}</title>
    </svg>
  ),
}));

const fetchMock = vi.fn();

const owner: SessionUser = {
  id: "user-owner",
  name: "Rina Pemilik",
  email: "owner@ravika.id",
  username: "owner",
  role: "OWNER",
  roleLabel: "Pemilik",
  permissions: ["tables.view", "tables.manage"],
};

const summary: TableSummary = {
  id: "table-1",
  name: "Meja 01",
  status: "OCCUPIED",
  isActive: true,
  activeOrderCount: 2,
  createdAt: "2026-11-15T08:00:00.000Z",
  updatedAt: "2026-11-15T08:00:00.000Z",
};

const detail: DiningTable = {
  ...summary,
  qrToken: "token-old",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

function mockApi(
  overrides: (url: string, init?: RequestInit) => Response | null = () => null,
) {
  fetchMock.mockImplementation(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const override = overrides(url, init);

      if (override) {
        return override;
      }

      if (url.startsWith("/api/tables?")) {
        return jsonResponse({
          items: [summary],
          page: 1,
          pageCount: 1,
          pageSize: 10,
          total: 1,
        });
      }

      if (url === "/api/tables/table-1" && !init?.method) {
        return jsonResponse(detail);
      }

      if (url === "/api/system/lan-url") {
        return jsonResponse({ url: "http://192.168.1.20:3000" });
      }

      return jsonResponse({}, 404);
    },
  );
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
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("TablesPage", () => {
  it("fetches the table detail only after the drawer opens", async () => {
    const user = userEvent.setup();
    mockApi();
    renderWithProviders(<TablesPage />, { user: owner });

    await screen.findAllByText("Meja 01");

    expect(
      fetchMock.mock.calls.some(([url]) => url === "/api/tables/table-1"),
    ).toBe(false);

    const detailButtons = await screen.findAllByRole("button", {
      name: "Detail",
    });
    await user.click(detailButtons[0]);

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) => url === "/api/tables/table-1" && !init?.method,
        ),
      ).toBe(true);
    });

    expect((await screen.findAllByTestId("table-qr"))[0]).toBeDefined();
    expect(
      screen.getAllByTestId("table-qr")[0]?.getAttribute("data-value"),
    ).toContain("/menu/token-old");
  });

  it("replaces the visible token after regenerating the QR", async () => {
    const user = userEvent.setup();
    mockApi((url, init) =>
      url === "/api/tables/table-1/regenerate-qr" && init?.method === "POST"
        ? jsonResponse({
            table: { ...detail, qrToken: "token-new" },
            qrToken: "token-new",
          })
        : null,
    );
    renderWithProviders(<TablesPage />, { user: owner });

    const detailButtons = await screen.findAllByRole("button", {
      name: "Detail",
    });
    await user.click(detailButtons[0]);
    await screen.findAllByTestId("table-qr");
    expect(
      screen.getAllByTestId("table-qr")[0]?.getAttribute("data-value"),
    ).toContain("/menu/token-old");

    await user.click(
      await screen.findByRole("button", { name: "Buat ulang token" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Ya, buat ulang" }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/tables/table-1/regenerate-qr",
        expect.objectContaining({ method: "POST" }),
      );
    });

    await waitFor(() => {
      expect(
        screen.getAllByTestId("table-qr")[0]?.getAttribute("data-value"),
      ).toContain("/menu/token-new");
    });
  });

  it("patches only the strict table fields", async () => {
    const user = userEvent.setup();
    mockApi((url, init) =>
      url === "/api/tables/table-1" && init?.method === "PATCH"
        ? jsonResponse({ ...detail, name: "Meja Utama" })
        : null,
    );
    renderWithProviders(<TablesPage />, { user: owner });

    const editButtons = await screen.findAllByRole("button", {
      name: "Ubah Meja 01",
    });
    await user.click(editButtons[0]);

    const nameInput = screen.getByLabelText(/^Nama atau nomor meja/);
    await user.clear(nameInput);
    await user.type(nameInput, "Meja Utama");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/tables/table-1",
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    const call = fetchMock.mock.calls.find(
      ([url, init]) =>
        url === "/api/tables/table-1" && init?.method === "PATCH",
    );

    expect(JSON.parse((call?.[1] as RequestInit).body as string)).toEqual({
      isActive: true,
      name: "Meja Utama",
      status: "OCCUPIED",
    });
  });
});
