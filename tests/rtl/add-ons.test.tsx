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
import AddOnsPage from "@/app/(dashboard)/app/add-ons/page";
import type { SessionUser } from "@/types/auth";
import type { AddOn } from "@/types/domain";
import { renderWithProviders } from "../helpers/render";

const fetchMock = vi.fn();

const owner: SessionUser = {
  id: "user-owner",
  name: "Rina Pemilik",
  email: "owner@ravika.id",
  username: "owner",
  role: "OWNER",
  roleLabel: "Pemilik",
  permissions: ["products.view", "products.manage"],
};

const addOn: AddOn = {
  id: "addon-extra-shot",
  businessId: "business-ravika",
  name: "Extra Shot",
  price: 5000,
  isActive: true,
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
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

describe("AddOnsPage", () => {
  it("creates an add-on and toggles active", async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);

        if (url === "/api/add-ons" && !init?.method) {
          return jsonResponse([addOn]);
        }
        if (url === "/api/add-ons" && init?.method === "POST") {
          return jsonResponse(
            { ...addOn, id: "addon-new", name: "Caramel" },
            201,
          );
        }
        if (
          url === "/api/add-ons/addon-extra-shot" &&
          init?.method === "PATCH"
        ) {
          return jsonResponse({ ...addOn, isActive: false });
        }
        return jsonResponse({}, 404);
      },
    );

    renderWithProviders(<AddOnsPage />, { user: owner });

    await screen.findAllByText("Extra Shot");
    await user.click(
      await screen.findByRole("button", { name: "Tambah add-on" }),
    );
    await user.type(screen.getByLabelText(/^Nama add-on/), "Caramel");
    await user.clear(screen.getByLabelText(/^Harga/));
    await user.type(screen.getByLabelText(/^Harga/), "4000");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) => url === "/api/add-ons" && init?.method === "POST",
        ),
      ).toBe(true);
    });

    const toggleButtons = await screen.findAllByRole("button", {
      name: "Nonaktifkan",
    });
    await user.click(toggleButtons[0]);

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) =>
            url === "/api/add-ons/addon-extra-shot" && init?.method === "PATCH",
        ),
      ).toBe(true);
    });
  });
});
