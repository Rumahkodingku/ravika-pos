"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Users } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/layout";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { DataTableToolbar } from "@/features/management/data-table-toolbar";
import { FormDrawer } from "@/features/management/form-drawer";
import {
  PermissionGate,
  RequirePermission,
} from "@/features/management/permission-gate";
import { ResponsiveList } from "@/features/management/responsive-list";
import { TablePagination } from "@/features/management/table-pagination";
import { TableSkeleton } from "@/features/management/table-skeleton";
import { useAsyncData } from "@/mocks/management/hooks";
import { managementService } from "@/mocks/management/service";
import type { ManagementUser, UserRole } from "@/types/domain";

const userSchema = z.object({
  name: z.string().min(1, "Nama pengguna wajib diisi."),
  email: z.string().email("Format email tidak valid."),
  role: z.enum(["OWNER", "CASHIER", "BARISTA"]),
  isActive: z.boolean(),
  password: z.string().optional(),
});

type UserValues = z.infer<typeof userSchema>;

const roleLabels: Record<UserRole, string> = {
  OWNER: "Pemilik",
  CASHIER: "Kasir",
  BARISTA: "Barista",
};

const emptyUser: UserValues = {
  name: "",
  email: "",
  role: "CASHIER",
  isActive: true,
  password: "",
};

export default function UsersPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [active, setActive] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ManagementUser | null>(null);

  const { data, error, isLoading, refresh } = useAsyncData(
    () =>
      managementService.listUsers({
        search,
        role,
        active,
        page,
        pageSize: 10,
      }),
    JSON.stringify([search, role, active, page]),
  );

  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<UserValues>({
    defaultValues: emptyUser,
    resolver: zodResolver(userSchema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ ...emptyUser });
    setFormOpen(true);
  };

  const openEdit = (user: ManagementUser) => {
    setEditing(user);
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      password: "",
    });
    setFormOpen(true);
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!editing && (values.password ?? "").length < 6) {
      setError("password", {
        message: "Kata sandi awal minimal 6 karakter.",
      });
      return;
    }

    try {
      const { password: _password, ...input } = values;
      if (editing) {
        await managementService.updateUser(editing.id, input);
        toast({ title: "Pengguna diperbarui", tone: "success" });
      } else {
        await managementService.createUser(input);
        toast({
          title: "Pengguna ditambahkan",
          description: "Akun demo login tetap tiga akun yang terdokumentasi.",
          tone: "success",
        });
      }
      setFormOpen(false);
      refresh();
    } catch (reason) {
      setError("root", {
        message:
          reason instanceof Error ? reason.message : "Pengguna gagal disimpan.",
      });
    }
  });

  return (
    <RequirePermission permission="users.view">
      <div className="flex flex-col gap-6">
        <PageHeader
          actions={
            <PermissionGate permission="users.manage">
              <Button onClick={openCreate}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                Tambah pengguna
              </Button>
            </PermissionGate>
          }
          description="Atur akses staf. Data simulasi."
          title="Pengguna"
        />

        <Card>
          <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
            <DataTableToolbar
              filters={
                <>
                  <Select
                    aria-label="Filter role"
                    className="w-40"
                    onChange={(event) => {
                      setRole(event.target.value);
                      setPage(1);
                    }}
                    value={role}
                  >
                    <option value="all">Semua role</option>
                    <option value="OWNER">Pemilik</option>
                    <option value="CASHIER">Kasir</option>
                    <option value="BARISTA">Barista</option>
                  </Select>
                  <Select
                    aria-label="Filter status aktif"
                    className="w-40"
                    onChange={(event) => {
                      setActive(event.target.value);
                      setPage(1);
                    }}
                    value={active}
                  >
                    <option value="all">Semua status</option>
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </Select>
                </>
              }
              hasActiveFilters={
                search !== "" || role !== "all" || active !== "all"
              }
              onReset={() => {
                setSearch("");
                setRole("all");
                setActive("all");
                setPage(1);
              }}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              resultCount={data?.total ?? 0}
              search={search}
              searchPlaceholder="Cari nama atau email"
            />

            {isLoading ? (
              <TableSkeleton columns={5} />
            ) : error ? (
              <ErrorState onRetry={refresh} />
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                action={
                  <PermissionGate permission="users.manage">
                    <Button onClick={openCreate} variant="outline">
                      Tambah pengguna pertama
                    </Button>
                  </PermissionGate>
                }
                description="Belum ada pengguna pada filter ini."
                icon={Users}
                title="Belum ada pengguna"
              />
            ) : (
              <ResponsiveList
                cards={data.items.map((user) => (
                  <div
                    className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3"
                    key={user.id}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-body font-medium text-foreground">
                          {user.name}
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                      <Badge tone={user.isActive ? "success" : "neutral"}>
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <span className="text-caption text-muted-foreground">
                      {roleLabels[user.role]}
                    </span>
                    <PermissionGate permission="users.manage">
                      <Button
                        onClick={() => openEdit(user)}
                        size="sm"
                        variant="outline"
                      >
                        <Pencil aria-hidden="true" className="h-4 w-4" />
                        Ubah
                      </Button>
                    </PermissionGate>
                  </div>
                ))}
                table={
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.items.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell>{roleLabels[user.role]}</TableCell>
                          <TableCell>
                            <Badge tone={user.isActive ? "success" : "neutral"}>
                              {user.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <PermissionGate permission="users.manage">
                              <Button
                                aria-label={`Ubah ${user.name}`}
                                onClick={() => openEdit(user)}
                                size="sm"
                                variant="ghost"
                              >
                                <Pencil
                                  aria-hidden="true"
                                  className="h-4 w-4"
                                />
                              </Button>
                            </PermissionGate>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                }
              />
            )}
          </CardContent>
          {data && data.total > 0 ? (
            <TablePagination
              onPageChange={setPage}
              page={data.page}
              pageCount={data.pageCount}
              pageSize={data.pageSize}
              total={data.total}
            />
          ) : null}
        </Card>

        <FormDrawer
          description={
            editing
              ? "Ubah profil dan akses pengguna."
              : "Tambahkan pengguna baru. Login demo tetap tiga akun."
          }
          formId="user-form"
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onOpenChange={setFormOpen}
          onSubmit={onSubmit}
          open={formOpen}
          title={editing ? "Ubah pengguna" : "Tambah pengguna"}
        >
          <Field
            error={errors.name?.message}
            htmlFor="user-name"
            label="Nama"
            required
          >
            <Input id="user-name" {...register("name")} />
          </Field>
          <Field
            error={errors.email?.message}
            htmlFor="user-email"
            label="Email"
            required
          >
            <Input id="user-email" type="email" {...register("email")} />
          </Field>
          {!editing ? (
            <Field
              description="Kata sandi hanya simulasi dan tidak dipakai untuk login."
              error={errors.password?.message}
              htmlFor="user-password"
              label="Kata sandi awal"
              required
            >
              <Input
                autoComplete="new-password"
                id="user-password"
                type="password"
                {...register("password")}
              />
            </Field>
          ) : null}
          <Field
            error={errors.role?.message}
            htmlFor="user-role"
            label="Role"
            required
          >
            <Select id="user-role" {...register("role")}>
              <option value="OWNER">Pemilik</option>
              <option value="CASHIER">Kasir</option>
              <option value="BARISTA">Barista</option>
            </Select>
          </Field>
          <label
            className="flex min-h-11 items-center gap-2 text-body text-foreground"
            htmlFor="user-active"
          >
            <Checkbox id="user-active" {...register("isActive")} />
            Pengguna aktif
          </label>
          <FieldDescription>
            Minimal satu pemilik harus tetap aktif. Aturan ini dicek oleh mock
            service.
          </FieldDescription>
          {errors.root?.message ? (
            <p
              className="rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-body text-danger-strong"
              role="alert"
            >
              {errors.root.message}
            </p>
          ) : null}
        </FormDrawer>
      </div>
    </RequirePermission>
  );
}
