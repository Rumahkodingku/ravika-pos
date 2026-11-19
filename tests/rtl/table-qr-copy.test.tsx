/** @vitest-environment jsdom */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TableQrCode } from "@/features/management/table-qr-code";
import { renderWithProviders } from "../helpers/render";

const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  writeText.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("table QR copy", () => {
  it("copies the full menu URL including the token", async () => {
    const events = userEvent.setup();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderWithProviders(
      <TableQrCode label="Meja 01" token="table-token-123" />,
    );

    const input = await screen.findByLabelText("URL menu pelanggan");

    await waitFor(() => {
      expect((input as HTMLInputElement).value).toContain(
        "/menu/table-token-123",
      );
    });

    await events.click(screen.getByRole("button", { name: "Salin tautan" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/menu/table-token-123`,
      );
    });
  });
});
