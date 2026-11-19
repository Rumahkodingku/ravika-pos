/** @vitest-environment jsdom */

import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TableQrCode } from "@/features/management/table-qr-code";
import { renderWithProviders } from "../helpers/render";

vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ title, value }: { title?: string; value: string }) => (
    <svg data-testid="table-qr" data-value={value}>
      <title>{title}</title>
    </svg>
  ),
}));

const fetchMock = vi.fn();

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

describe("TableQrCode", () => {
  it("renders the QR with the LAN menu URL and no copy controls", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) =>
      String(input) === "/api/system/lan-url"
        ? jsonResponse({ url: "http://192.168.1.20:3000" })
        : jsonResponse({}, 404),
    );

    renderWithProviders(
      <TableQrCode label="Meja 01" token="table-token-123" />,
    );

    await waitFor(() => {
      expect(
        screen.getAllByTestId("table-qr")[0]?.getAttribute("data-value"),
      ).toBe("http://192.168.1.20:3000/menu/table-token-123");
    });

    expect(screen.queryByRole("button", { name: "Salin tautan" })).toBeNull();
    expect(screen.queryByDisplayValue(/\/menu\//)).toBeNull();
  });

  it("disables the print action when no LAN URL is available", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) =>
      String(input) === "/api/system/lan-url"
        ? jsonResponse({ url: null })
        : jsonResponse({}, 404),
    );

    renderWithProviders(
      <TableQrCode label="Meja 01" token="table-token-123" />,
    );

    expect(
      await screen.findByText(
        "URL LAN belum tersedia. Atur jaringan di halaman Pengaturan.",
      ),
    ).toBeTruthy();
    expect(screen.queryAllByTestId("table-qr")).toHaveLength(0);
    expect(
      (
        screen.getByRole("button", { name: "Pratinjau cetak" }) as
          | HTMLButtonElement
          | undefined
      )?.disabled,
    ).toBe(true);
  });
});
