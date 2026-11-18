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
import RolesPage from "@/app/(dashboard)/app/roles/page";
import UsersPage from "@/app/(dashboard)/app/users/page";
import type { ManagementUser, Permission, Role } from "@/types/domain";
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
  permissions: [
    "users.view",
    "users.manage",
    "roles.manage",
    "permissions.manage",
  ],
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

const ownerRole: Role = {
  id: "role-owner",
  name: "Pemilik",
  code: "OWNER",
  description: "Akses penuh.",
  isSystem: true,
  permissionCodes: ["users.view", "users.manage"],
};

const cashierRole: Role = {
  id: "role-cashier",
  name: "Kasir",
  code: "CASHIER",
  description: "Membuat pesanan.",
  isSystem: true,
  permissionCodes: ["users.view"],
};

const permissions: Permission[] = [
  { code: "users.view", label: "Lihat pengguna uji", group: "Grup uji" },
  { code: "users.manage", label: "Kelola pengguna uji", group: "Grup uji" },
  { code: "roles.manage", label: "Kelola peran uji", group: "Grup peran uji" },
];

function mockRolesApi(
  overrides: (url: string, init?: RequestInit) => Response | null,
) {
  mockApi((url, init) => {
    const override = overrides(url, init);

    if (override) {
      return override;
    }

    if (url === "/api/roles" && !init?.method) {
      return jsonResponse([cashierRole]);
    }

    if (url === "/api/permissions") {
      return jsonResponse(permissions);
    }

    return null;
  });
}

describe("RolesPage", () => {
  it("renders permission groups from the API", async () => {
    const user = userEvent.setup();
    mockRolesApi(() => null);
    renderWithProviders(<RolesPage />, { user: owner });

    const editButtons = await screen.findAllByRole("button", {
      name: "Ubah Kasir",
    });
    await user.click(editButtons[0]);

    expect((await screen.findAllByText("Grup uji")).length).toBeGreaterThan(0);
    expect(
      (await screen.findAllByText("Lihat pengguna uji")).length,
    ).toBeGreaterThan(0);
    expect(
      (await screen.findAllByText("Kelola peran uji")).length,
    ).toBeGreaterThan(0);
  });

  it("patches the role then puts its permissions", async () => {
    const user = userEvent.setup();
    mockRolesApi((url, init) => {
      if (url === "/api/roles/role-cashier" && init?.method === "PATCH") {
        return jsonResponse(cashierRole);
      }

      if (
        url === "/api/roles/role-cashier/permissions" &&
        init?.method === "PUT"
      ) {
        return jsonResponse(cashierRole);
      }

      return null;
    });
    renderWithProviders(<RolesPage />, { user: owner });

    const editButtons = await screen.findAllByRole("button", {
      name: "Ubah Kasir",
    });
    await user.click(editButtons[0]);
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/roles/role-cashier/permissions",
        expect.objectContaining({ method: "PUT" }),
      );
    });

    const patchIndex = fetchMock.mock.calls.findIndex(
      ([url, init]) =>
        url === "/api/roles/role-cashier" && init?.method === "PATCH",
    );
    const putIndex = fetchMock.mock.calls.findIndex(
      ([url, init]) =>
        url === "/api/roles/role-cashier/permissions" && init?.method === "PUT",
    );

    expect(patchIndex).toBeGreaterThan(-1);
    expect(putIndex).toBeGreaterThan(patchIndex);

    const patchBody = JSON.parse(
      (fetchMock.mock.calls[patchIndex][1] as RequestInit).body as string,
    );
    const putBody = JSON.parse(
      (fetchMock.mock.calls[putIndex][1] as RequestInit).body as string,
    );

    expect(patchBody).not.toHaveProperty("permissionCodes");
    expect(patchBody).toMatchObject({
      code: "CASHIER",
      description: "Membuat pesanan.",
      name: "Kasir",
    });
    expect(putBody).toEqual({ permissionCodes: ["users.view"] });
  });

  it("disables the code field of a system role", async () => {
    const user = userEvent.setup();
    mockRolesApi((url, init) =>
      url === "/api/roles" && !init?.method ? jsonResponse([ownerRole]) : null,
    );
    renderWithProviders(<RolesPage />, { user: owner });

    const editButtons = await screen.findAllByRole("button", {
      name: "Ubah Pemilik",
    });
    await user.click(editButtons[0]);

    expect((screen.getByLabelText(/^Kode/) as HTMLInputElement).disabled).toBe(
      true,
    );
  });

  it("skips the permissions request without permissions.manage", async () => {
    const roleManager = {
      ...owner,
      permissions: ["roles.manage"],
      role: "SUPERVISOR",
      roleLabel: "Supervisor",
    };
    mockRolesApi((url, init) =>
      url === "/api/permissions" && !init?.method
        ? jsonResponse({ status: 403 }, 403)
        : null,
    );
    renderWithProviders(<RolesPage />, { user: roleManager });

    expect((await screen.findAllByText("Kasir")).length).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: "Ubah Kasir" }).length,
    ).toBeGreaterThan(0);
    expect(
      fetchMock.mock.calls.some(([url]) =>
        String(url).startsWith("/api/permissions"),
      ),
    ).toBe(false);
  });

  it("patches the role without putting permissions without permissions.manage", async () => {
    const user = userEvent.setup();
    const roleManager = {
      ...owner,
      permissions: ["roles.manage"],
      role: "SUPERVISOR",
      roleLabel: "Supervisor",
    };
    mockRolesApi((url, init) =>
      url === "/api/roles/role-cashier" && init?.method === "PATCH"
        ? jsonResponse(cashierRole)
        : null,
    );
    renderWithProviders(<RolesPage />, { user: roleManager });

    const editButtons = await screen.findAllByRole("button", {
      name: "Ubah Kasir",
    });
    await user.click(editButtons[0]);

    expect(
      screen.getByText(/Anda tidak dapat mengubah izin peran/),
    ).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/roles/role-cashier",
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url) === "/api/roles/role-cashier/permissions" &&
          init?.method === "PUT",
      ),
    ).toBe(false);
  });
});
