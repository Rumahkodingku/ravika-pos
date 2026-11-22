"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Field, FieldDescription } from "@/components/ui/field";
import { Input, PasswordInput } from "@/components/ui/input";
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
import { useSession } from "@/features/auth/session-provider";
import { useRoleOptionsQuery } from "@/features/management/api/roles";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "@/features/management/api/users";
import { DataTableToolbar } from "@/features/management/data-table-toolbar";
import { FormDrawer } from "@/features/management/form-drawer";
import {
  PermissionGate,
  RequirePermission,
} from "@/features/management/permission-gate";
import { ResponsiveList } from "@/features/management/responsive-list";
import { TablePagination } from "@/features/management/table-pagination";
import { TableSkeleton } from "@/features/management/table-skeleton";
import type { ManagementUser } from "@/types/domain";

const userSchema = z.object({
  name: z.string().min(1, "Nama pengguna wajib diisi."),
  email: z.string().email("Format email tidak valid."),
  username: z
    .string()
    .trim()
    .max(40)
    .refine(
      (value) => value === "" || value.length >= 2,
      "Username minimal 2 karakter.",
    )
    .optional(),
  role: z.string().min(1, "Role wajib dipilih."),
  isActive: z.boolean(),
  password: z.string().optional(),
});

type UserValues = z.infer<typeof userSchema>;

const emptyUser: UserValues = {
  name: "",
  email: "",
  username: "",
  role: "CASHIER",
  isActive: true,
  password: "",
};

const resetPasswordSchema = z
  .object({
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi kata sandi baru wajib diisi."),
    password: z.string().min(8, "Kata sandi minimal 8 karakter."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Kata sandi baru tidak cocok.",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function UsersPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user: currentUser } = useSession();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [active, setActive] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ManagementUser | null>(null);
  const [resettingUser, setResettingUser] = useState<ManagementUser | null>(
    null,
  );
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);

  const { data, error, isLoading, refetch } = useUsersQuery({
    search,
    role,
    active,
    page,
    pageSize: 10,
  });
  const { data: roleOptions = [] } = useRoleOptionsQuery();
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const resetPasswordMutation = useResetUserPasswordMutation();

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

  const resetPasswordForm = useForm<ResetPasswordValues>({
    defaultValues: { password: "", confirmPassword: "" },
    resolver: zodResolver(resetPasswordSchema),
  });

  const availableRoles =
    editing?.role === "OWNER"
      ? roleOptions.filter((option) => option.code === "OWNER")
      : roleOptions.filter((option) =>
          ["CASHIER", "KITCHEN"].includes(option.code),
        );

  const openCreate = () => {
    setEditing(null);
    reset({ ...emptyUser });
    setFormOpen(true);
  };

  const openEdit = (user: ManagementUser) => {
    setEditing(user);
    reset({
      email: user.email,
      isActive: user.isActive,
      name: user.name,
      password: "",
      role: user.role,
      username: user.username,
    });
    setFormOpen(true);
  };

  const openResetPassword = (user: ManagementUser) => {
    setResettingUser(user);
    resetPasswordForm.reset({ confirmPassword: "", password: "" });
    setResetPasswordOpen(true);
  };

  const closeResetPassword = (open: boolean) => {
    if (!open) {
      setResettingUser(null);
      resetPasswordForm.reset({ confirmPassword: "", password: "" });
    }
    setResetPasswordOpen(open);
  };

  const deactivateUser = async (user: ManagementUser) => {
    if (!window.confirm(`Nonaktifkan ${user.name}?`)) {
      return;
    }

    try {
      await deleteUserMutation.mutateAsync(user.id);
      toast({ title: "Pengguna dinonaktifkan", tone: "success" });
    } catch (reason) {
      toast({
        description:
          reason instanceof Error
            ? reason.message
            : "Gagal menonaktifkan pengguna.",
        title: "Gagal menonaktifkan pengguna",
        tone: "danger",
      });
    }
  };

  const onResetPassword = resetPasswordForm.handleSubmit(async (values) => {
    if (!resettingUser) {
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({
        id: resettingUser.id,
        password: values.password,
      });
      toast({ title: "Kata sandi direset", tone: "success" });
      closeResetPassword(false);
    } catch (reason) {
      resetPasswordForm.setError("root", {
        message:
          reason instanceof Error
            ? reason.message
            : "Kata sandi gagal direset.",
      });
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    if (!editing && (values.password ?? "").length < 8) {
      setError("password", {
        message: "Kata sandi awal minimal 8 karakter.",
      });
      return;
    }

    try {
      if (editing) {
        const { password: _password, ...input } = values;
        await updateUserMutation.mutateAsync({
          id: editing.id,
          input: {
            ...input,
            username: values.username?.trim() || editing.username,
          },
        });
        if (editing.id === currentUser.id) {
          router.refresh();
        }
        toast({ title: "Pengguna diperbarui", tone: "success" });
      } else {
        await createUserMutation.mutateAsync({
          ...values,
          password: values.password ?? "",
          username: values.username?.trim() || undefined,
        });
        toast({ title: "Pengguna ditambahkan", tone: "success" });
      }
      setFormOpen(false);
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
          description="Atur akses staf."
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
                    {roleOptions.map((option) => (
                      <option key={option.id} value={option.code}>
                        {option.name}
                      </option>
                    ))}
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
              <ErrorState onRetry={() => void refetch()} />
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
                      {user.roleLabel}
                    </span>
                    <PermissionGate permission="users.manage">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => openEdit(user)}
                          size="sm"
                          variant="outline"
                        >
                          <Pencil aria-hidden="true" className="h-4 w-4" />
                          Ubah
                        </Button>
                        {user.role !== "OWNER" ? (
                          <>
                            <Button
                              onClick={() => openResetPassword(user)}
                              size="sm"
                              variant="outline"
                            >
                              <KeyRound
                                aria-hidden="true"
                                className="h-4 w-4"
                              />
                              Reset
                            </Button>
                            <Button
                              onClick={() => void deactivateUser(user)}
                              size="sm"
                              variant="danger"
                            >
                              <Trash2 aria-hidden="true" className="h-4 w-4" />
                              Nonaktifkan
                            </Button>
                          </>
                        ) : null}
                      </div>
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
                          <TableCell>{user.roleLabel}</TableCell>
                          <TableCell>
                            <Badge tone={user.isActive ? "success" : "neutral"}>
                              {user.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <PermissionGate permission="users.manage">
                              <div className="flex justify-end gap-1">
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
                                {user.role !== "OWNER" ? (
                                  <>
                                    <Button
                                      aria-label={`Reset password ${user.name}`}
                                      onClick={() => openResetPassword(user)}
                                      size="sm"
                                      variant="ghost"
                                    >
                                      <KeyRound
                                        aria-hidden="true"
                                        className="h-4 w-4"
                                      />
                                    </Button>
                                    <Button
                                      aria-label={`Nonaktifkan ${user.name}`}
                                      onClick={() => void deactivateUser(user)}
                                      size="sm"
                                      variant="ghost"
                                    >
                                      <Trash2
                                        aria-hidden="true"
                                        className="h-4 w-4"
                                      />
                                    </Button>
                                  </>
                                ) : null}
                              </div>
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
              : "Tambahkan pengguna baru."
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
          <Field
            error={errors.username?.message}
            htmlFor="user-username"
            label="Username (opsional)"
          >
            <Input id="user-username" {...register("username")} />
          </Field>
          {!editing ? (
            <Field
              error={errors.password?.message}
              htmlFor="user-password"
              label="Kata sandi awal"
              required
            >
              <PasswordInput
                autoComplete="new-password"
                id="user-password"
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
              {availableRoles.map((option) => (
                <option key={option.id} value={option.code}>
                  {option.name}
                </option>
              ))}
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
            Minimal satu pemilik harus tetap aktif.
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

        <Dialog
          description="Kata sandi lama pengguna akan diganti dan sesi aktifnya dicabut."
          footer={
            <>
              <Button
                onClick={() => closeResetPassword(false)}
                variant="outline"
              >
                Batal
              </Button>
              <Button
                form="reset-user-password-form"
                isLoading={resetPasswordMutation.isPending}
                type="submit"
                variant="primary"
              >
                Simpan
              </Button>
            </>
          }
          onOpenChange={closeResetPassword}
          open={resetPasswordOpen}
          size="sm"
          title={
            resettingUser
              ? `Reset kata sandi ${resettingUser.name}`
              : "Reset kata sandi"
          }
        >
          <form
            className="flex flex-col gap-4"
            id="reset-user-password-form"
            onSubmit={onResetPassword}
          >
            <Field
              error={resetPasswordForm.formState.errors.password?.message}
              htmlFor="reset-user-password"
              label="Kata sandi baru"
              required
            >
              <PasswordInput
                autoComplete="new-password"
                id="reset-user-password"
                {...resetPasswordForm.register("password")}
              />
            </Field>
            <Field
              error={
                resetPasswordForm.formState.errors.confirmPassword?.message
              }
              htmlFor="reset-user-password-confirm"
              label="Konfirmasi kata sandi baru"
              required
            >
              <PasswordInput
                autoComplete="new-password"
                id="reset-user-password-confirm"
                {...resetPasswordForm.register("confirmPassword")}
              />
            </Field>
            {resetPasswordForm.formState.errors.root?.message ? (
              <p
                className="rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-body text-danger-strong"
                role="alert"
              >
                {resetPasswordForm.formState.errors.root.message}
              </p>
            ) : null}
          </form>
        </Dialog>
      </div>
    </RequirePermission>
  );
}
