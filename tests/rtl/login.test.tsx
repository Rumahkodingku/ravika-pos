/** @vitest-environment jsdom */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth/login-form";
import { renderWithProviders } from "../helpers/render";

const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

const fetchMock = vi.fn();

const cashier = {
  id: "user-cashier",
  name: "Bagas Kasir",
  email: "cashier@ravika.id",
  username: "cashier",
  role: "CASHIER",
  roleLabel: "Kasir",
  permissions: ["orders.create", "payments.view"],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  replaceMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("LoginForm", () => {
  it("redirects a cashier to the POS after login", async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input).includes("/setup/status")) {
        return jsonResponse({ setupRequired: false });
      }
      return jsonResponse(cashier);
    });

    renderWithProviders(<LoginForm />);

    await user.type(
      screen.getByLabelText(/Email atau username/),
      "cashier@ravika.id",
    );
    await user.type(screen.getByLabelText(/Kata sandi/), "demo123");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/app/pos");
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("shows a generic error when the credentials are rejected", async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input).includes("/setup/status")) {
        return jsonResponse({ setupRequired: false });
      }
      return new Response(
        JSON.stringify({
          status: 401,
          detail: "Email atau kata sandi salah.",
          code: "AUTH_INVALID_CREDENTIALS",
        }),
        {
          headers: { "content-type": "application/problem+json" },
          status: 401,
        },
      );
    });

    renderWithProviders(<LoginForm />);

    await user.type(
      screen.getByLabelText(/Email atau username/),
      "cashier@ravika.id",
    );
    await user.type(screen.getByLabelText(/Kata sandi/), "salah-sekali");
    await user.click(screen.getByRole("button", { name: "Masuk" }));

    expect(
      await screen.findByText("Email, username, atau kata sandi tidak cocok."),
    ).toBeDefined();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
