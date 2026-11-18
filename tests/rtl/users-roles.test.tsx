/** @vitest-environment jsdom */

import { screen, waitFor, within } from "@testing-library/react";
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
import UsersPage from "@/app/(dashboard)/app/users/page";
import type { ManagementUser } from "@/types/domain";
import { renderWithProviders } from "../helpers/render";

const { refreshMock } = vi.hoisted(() => ({ refreshMock: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const fetchMock = vi.fn();

const owner = {
  id: "user-owner",
  name: "Rina Pemilik",
  email: "owner@ravika.id",
  username: "owner",
  role: "OWNER",
  roleLabel: "Pemilik",
  permissions: ["users.view", "users.manage", "roles.manage"],
};

const cashierUser: ManagementUser = {
  id: "user-cashier",
  name: "Bagas Kasir",
  email: "cashier@ravika.id",
  role: "CASHIER",
  roleLabel: "Kasir",
  isActive: true,
  createdAt: "2026-11-15T08:00:00.000Z",
  updatedAt: "2026-11-15T08:00:00.000Z",
};

const roleOptions = [
  { id: "role-owner", code: "OWNER", name: "Pemilik" },
  { id: "role-cashier", code: "CASHIER", name: "Kasir" },
  { id: "role-barista", code: "BARISTA", name: "Barista" },
  { id: "role-supervisor", code: "SUPERVISOR", name: "Supervisor" },
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    status,
  });
}

function usersPage(items: ManagementUser[] = [cashierUser]) {
  return {
    items,
    page: 1,
    pageCount: 1,
    pageSize: 10,
    total: items.length,
  };
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
  refreshMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockApi(
  overrides: (url: string, init?: RequestInit) => Response | null,
) {
  fetchMock.mockImplementation(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const override = overrides(url, init);

      if (override) {
        return override;
      }

      if (url.startsWith("/api/roles/options")) {
        return jsonResponse(roleOptions);
      }

      if (url.startsWith("/api/users?")) {
        return jsonResponse(usersPage());
      }

      return jsonResponse({}, 404);
    },
  );
}

describe("UsersPage", () => {
  it("renders role options from the API", async () => {
    mockApi(() => null);
    renderWithProviders(<UsersPage />, { user: owner });

    expect((await screen.findAllByText("Bagas Kasir")).length).toBeGreaterThan(
      0,
    );

    const filter = (await screen.findAllByLabelText("Filter role"))[0];

    expect(
      await within(filter).findByRole("option", { name: "Supervisor" }),
    ).toBeDefined();
  });

  it("sends the initial password when creating a user", async () => {
    const user = userEvent.setup();
    mockApi((url, init) =>
      url === "/api/users" && init?.method === "POST"
        ? jsonResponse({ ...cashierUser, id: "user-new" }, 201)
        : null,
    );
    renderWithProviders(<UsersPage />, { user: owner });

    await user.click(
      await screen.findByRole("button", { name: "Tambah pengguna" }),
    );
    await user.type(screen.getByLabelText(/^Nama/), "Supervisor Satu");
    await user.type(screen.getByLabelText(/^Email/), "sup@ravika.id");
    await user.type(screen.getByLabelText(/Kata sandi awal/), "rahasia123");
    await user.selectOptions(screen.getByLabelText(/^Role/), "SUPERVISOR");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/users",
        expect.objectContaining({ method: "POST" }),
      );
    });

    const call = fetchMock.mock.calls.find(
      ([url, init]) => url === "/api/users" && init?.method === "POST",
    );
    const body = JSON.parse((call?.[1] as RequestInit).body as string);

    expect(body).toEqual({
      email: "sup@ravika.id",
      isActive: true,
      name: "Supervisor Satu",
      password: "rahasia123",
      role: "SUPERVISOR",
    });
  });

  it("omits the password when editing a user", async () => {
    const user = userEvent.setup();
    mockApi((url, init) =>
      url === "/api/users/user-cashier" && init?.method === "PATCH"
        ? jsonResponse(cashierUser)
        : null,
    );
    renderWithProviders(<UsersPage />, { user: owner });

    const editButtons = await screen.findAllByRole("button", {
      name: "Ubah Bagas Kasir",
    });
    await user.click(editButtons[0]);
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/users/user-cashier",
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    const call = fetchMock.mock.calls.find(
      ([url, init]) =>
        url === "/api/users/user-cashier" && init?.method === "PATCH",
    );
    const body = JSON.parse((call?.[1] as RequestInit).body as string);

    expect(body).not.toHaveProperty("password");
    expect(body).toMatchObject({
      email: "cashier@ravika.id",
      name: "Bagas Kasir",
      role: "CASHIER",
    });
  });

  it("shows the duplicate email detail in the form root", async () => {
    const user = userEvent.setup();
    mockApi((url, init) =>
      url === "/api/users/user-cashier" && init?.method === "PATCH"
        ? jsonResponse(
            {
              code: "USER_EMAIL_CONFLICT",
              detail: "Email sudah dipakai.",
              status: 409,
            },
            409,
          )
        : null,
    );
    renderWithProviders(<UsersPage />, { user: owner });

    const editButtons = await screen.findAllByRole("button", {
      name: "Ubah Bagas Kasir",
    });
    await user.click(editButtons[0]);
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    expect(await screen.findByText("Email sudah dipakai.")).toBeDefined();
  });
});
