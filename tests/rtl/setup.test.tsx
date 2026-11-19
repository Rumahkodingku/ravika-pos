/** @vitest-environment jsdom */

import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import { RestartRequiredProvider } from "@/features/system/restart-required";
import { createTestQueryClient } from "../helpers/render";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

import SetupPage from "@/app/setup/page";

const fetchMock = vi.fn();

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RestartRequiredProvider>{children}</RestartRequiredProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  window.localStorage.clear();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { ...window.location, reload: vi.fn() },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SetupPage", () => {
  it("creates the first owner and shows the restart screen", async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url.startsWith("/api/setup/status")) {
          return jsonResponse({ setupRequired: true });
        }
        if (
          url.startsWith("/api/setup") &&
          !url.includes("/status") &&
          init?.method === "POST"
        ) {
          return jsonResponse(
            {
              redirectUrl: "http://10.0.0.5:3000/login",
              restartRequired: true,
              setupComplete: true,
            },
            201,
          );
        }
        if (url.startsWith("/api/health")) {
          return new Response(null, { status: 503 });
        }
        return jsonResponse({}, 404);
      },
    );

    render(<SetupPage />, { wrapper: Wrapper });

    await user.type(await screen.findByLabelText(/^Nama bisnis/), "Setup Cafe");
    await user.type(await screen.findByLabelText(/^Kode bisnis/), "setup");
    await user.type(await screen.findByLabelText(/^Nama owner/), "Owner Setup");
    await user.type(
      await screen.findByLabelText(/^Email owner/),
      "owner.setup@ravika.id",
    );
    await user.type(
      await screen.findByLabelText(/^Kata sandi owner/),
      "setuppass123",
    );
    await user.type(
      await screen.findByLabelText(/^Konfirmasi kata sandi/),
      "setuppass123",
    );
    await user.click(
      await screen.findByRole("button", { name: "Selesaikan instalasi" }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/setup",
        expect.objectContaining({ method: "POST" }),
      );
    });

    const call = fetchMock.mock.calls.find(
      ([url, init]) => url === "/api/setup" && init?.method === "POST",
    );
    const body = JSON.parse((call?.[1] as RequestInit).body as string);

    expect(body.businessName).toBe("Setup Cafe");
    expect(body.ownerEmail).toBe("owner.setup@ravika.id");
    expect(screen.getByText("Restart diperlukan")).toBeTruthy();
    expect(window.localStorage.getItem("ravika-post-setup-url")).toBe(
      "http://10.0.0.5:3000/login",
    );
  });

  it("blocks mismatched password confirmation", async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input).includes("/api/setup/status")) {
        return jsonResponse({ setupRequired: true });
      }
      return jsonResponse({}, 404);
    });

    render(<SetupPage />, { wrapper: Wrapper });

    await user.type(await screen.findByLabelText(/^Nama bisnis/), "Setup Cafe");
    await user.type(await screen.findByLabelText(/^Kode bisnis/), "setup");
    await user.type(await screen.findByLabelText(/^Nama owner/), "Owner Setup");
    await user.type(
      await screen.findByLabelText(/^Email owner/),
      "owner.setup@ravika.id",
    );
    await user.type(
      await screen.findByLabelText(/^Kata sandi owner/),
      "setuppass123",
    );
    await user.type(
      screen.getByLabelText(/^Konfirmasi kata sandi/),
      "differentpass",
    );
    await user.click(
      await screen.findByRole("button", { name: "Selesaikan instalasi" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("Konfirmasi kata sandi tidak cocok."),
      ).toBeTruthy();
    });

    expect(
      fetchMock.mock.calls.some(
        ([url, init]) => url === "/api/setup" && init?.method === "POST",
      ),
    ).toBe(false);
  });
});
