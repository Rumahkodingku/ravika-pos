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
import { ChangePasswordDialog } from "@/features/auth/change-password-dialog";
import { renderWithProviders } from "../helpers/render";

const fetchMock = vi.fn();

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
  fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ChangePasswordDialog", () => {
  it("posts the current and new password then closes", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <ChangePasswordDialog onOpenChange={onOpenChange} open />,
    );

    await user.type(
      screen.getByLabelText(/Kata sandi saat ini/),
      "lama-sekali",
    );
    await user.type(screen.getByLabelText(/^Kata sandi baru/), "baru-sekali");
    await user.type(
      screen.getByLabelText(/Konfirmasi kata sandi baru/),
      "baru-sekali",
    );
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    const [path, init] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(path).toBe("/api/auth/change-password");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      currentPassword: "lama-sekali",
      newPassword: "baru-sekali",
    });
  });

  it("blocks submission when the confirmation does not match", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    renderWithProviders(
      <ChangePasswordDialog onOpenChange={onOpenChange} open />,
    );

    await user.type(
      screen.getByLabelText(/Kata sandi saat ini/),
      "lama-sekali",
    );
    await user.type(screen.getByLabelText(/^Kata sandi baru/), "baru-sekali");
    await user.type(
      screen.getByLabelText(/Konfirmasi kata sandi baru/),
      "beda-sekali",
    );
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(
      await screen.findByText("Kata sandi baru tidak cocok."),
    ).toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
