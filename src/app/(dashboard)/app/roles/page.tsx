"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/layout";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useSession } from "@/features/auth/session-provider";
import {
  useCreateRoleMutation,
  usePermissionsQuery,
  useRolesQuery,
  useUpdateRoleMutation,
} from "@/features/management/api/roles";
import { FormDrawer } from "@/features/management/form-drawer";
import {
  PermissionGate,
  RequirePermission,
} from "@/features/management/permission-gate";
import { ResponsiveList } from "@/features/management/responsive-list";
import { TableSkeleton } from "@/features/management/table-skeleton";
import type { Permission, Role } from "@/types/domain";

const roleSchema = z.object({
  name: z.string().min(1, "Nama role wajib diisi."),
  code: z
    .string()
    .min(2, "Kode minimal 2 karakter.")
    .max(20, "Kode maksimal 20 karakter."),
  description: z.string(),
  permissionCodes: z.array(z.string()),
});

type RoleValues = z.infer<typeof roleSchema>;

const emptyRole: RoleValues = {
  name: "",
  code: "",
  description: "",
  permissionCodes: [],
};

function groupPermissions(permissions: Permission[]) {
  const groups = new Map<string, Permission[]>();

  for (const permission of permissions) {
    groups.set(permission.group, [
      ...(groups.get(permission.group) ?? []),
      permission,
    ]);
  }

  return Array.from(groups, ([label, items]) => ({
    label,
    permissions: items,
  }));
}

export default function RolesPage() {
  const { toast } = useToast();
  const { user } = useSession();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);

  const canManagePermissions = user.permissions.includes("permissions.manage");
  const rolesQuery = useRolesQuery();
  const permissionsQuery = usePermissionsQuery(canManagePermissions);
  const createRoleMutation = useCreateRoleMutation();
  const updateRoleMutation = useUpdateRoleMutation();

  const data = rolesQuery.data;
  const permissionGroups = canManagePermissions
    ? groupPermissions(permissionsQuery.data ?? [])
    : [];
  const isLoading =
    rolesQuery.isLoading ||
    (canManagePermissions && permissionsQuery.isLoading);
  const error =
    rolesQuery.error ?? (canManagePermissions ? permissionsQuery.error : null);

  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    watch,
  } = useForm<RoleValues>({
    defaultValues: emptyRole,
    resolver: zodResolver(roleSchema),
  });

  const selectedPermissions = watch("permissionCodes");

  const openCreate = () => {
    setEditing(null);
    reset(emptyRole);
    setFormOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    reset({
      name: role.name,
      code: role.code,
      description: role.description,
      permissionCodes: role.permissionCodes,
    });
    setFormOpen(true);
  };

  const togglePermission = (code: string) => {
    const next = selectedPermissions.includes(code)
      ? selectedPermissions.filter((item) => item !== code)
      : [...selectedPermissions, code];
    setValue("permissionCodes", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const toggleGroup = (codes: string[]) => {
    const allSelected = codes.every((code) =>
      selectedPermissions.includes(code),
    );
    const next = allSelected
      ? selectedPermissions.filter((code) => !codes.includes(code))
      : Array.from(new Set([...selectedPermissions, ...codes]));
    setValue("permissionCodes", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    if (canManagePermissions && values.permissionCodes.length === 0) {
      setError("permissionCodes", { message: "Pilih minimal satu izin." });
      return;
    }

    try {
      if (editing) {
        await updateRoleMutation.mutateAsync({
          id: editing.id,
          input: {
            name: values.name,
            code: values.code,
            description: values.description,
          },
          permissionCodes: canManagePermissions
            ? values.permissionCodes
            : undefined,
        });
        toast({ title: "Peran diperbarui", tone: "success" });
      } else {
        await createRoleMutation.mutateAsync({
          name: values.name,
          code: values.code,
          description: values.description,
          ...(canManagePermissions
            ? { permissionCodes: values.permissionCodes }
            : {}),
        });
        toast({ title: "Peran ditambahkan", tone: "success" });
      }
      setFormOpen(false);
    } catch (reason) {
      setError("root", {
        message:
          reason instanceof Error ? reason.message : "Peran gagal disimpan.",
      });
    }
  });

  return (
    <RequirePermission permission="roles.manage">
      <div className="flex flex-col gap-6">
        <PageHeader
          actions={
            <PermissionGate permission="roles.manage">
              <Button onClick={openCreate}>
                <Plus aria-hidden="true" className="h-4 w-4" />
                Tambah peran
              </Button>
            </PermissionGate>
          }
          description="Atur izin untuk setiap peran. Perubahan langsung memengaruhi navigasi sesi terkait."
          title="Peran dan izin"
        />

        <Card>
          <CardContent className="p-3 sm:p-4">
            {isLoading ? (
              <TableSkeleton columns={5} />
            ) : error ? (
              <ErrorState
                onRetry={() => {
                  void rolesQuery.refetch();
                  if (canManagePermissions) {
                    void permissionsQuery.refetch();
                  }
                }}
              />
            ) : !data || data.length === 0 ? (
              <EmptyState
                action={
                  <Button onClick={openCreate} variant="outline">
                    Tambah peran pertama
                  </Button>
                }
                description="Belum ada peran. Tambah peran untuk mengatur akses."
                icon={ShieldCheck}
                title="Belum ada peran"
              />
            ) : (
              <ResponsiveList
                cards={data.map((role) => (
                  <div
                    className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3"
                    key={role.id}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-body font-medium text-foreground">
                          {role.name}
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {role.code}
                        </span>
                      </div>
                      {role.isSystem ? <Badge tone="info">Bawaan</Badge> : null}
                    </div>
                    <span className="text-caption text-muted-foreground">
                      {role.permissionCodes.length} izin.{" "}
                      {role.description || "Tidak ada deskripsi."}
                    </span>
                    <Button
                      onClick={() => openEdit(role)}
                      size="sm"
                      variant="outline"
                    >
                      <Pencil aria-hidden="true" className="h-4 w-4" />
                      Ubah izin
                    </Button>
                  </div>
                ))}
                table={
                  <table className="w-full text-body">
                    <thead className="bg-surface-subtle">
                      <tr className="border-b border-border">
                        <th className="h-10 px-3 text-left text-label font-medium text-muted-foreground">
                          Nama
                        </th>
                        <th className="h-10 px-3 text-left text-label font-medium text-muted-foreground">
                          Kode
                        </th>
                        <th className="h-10 px-3 text-left text-label font-medium text-muted-foreground">
                          Deskripsi
                        </th>
                        <th className="h-10 px-3 text-left text-label font-medium text-muted-foreground">
                          Izin
                        </th>
                        <th className="h-10 px-3 text-left text-label font-medium text-muted-foreground">
                          Tipe
                        </th>
                        <th className="h-10 px-3 text-right text-label font-medium text-muted-foreground">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((role) => (
                        <tr className="border-b border-border" key={role.id}>
                          <td className="px-3 py-3 font-medium">{role.name}</td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {role.code}
                          </td>
                          <td className="max-w-72 truncate px-3 py-3 text-muted-foreground">
                            {role.description || "Tidak ada"}
                          </td>
                          <td className="px-3 py-3 tabular-nums">
                            {role.permissionCodes.length}
                          </td>
                          <td className="px-3 py-3">
                            {role.isSystem ? (
                              <Badge tone="info">Bawaan</Badge>
                            ) : (
                              <Badge tone="neutral">Kustom</Badge>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <Button
                              aria-label={`Ubah ${role.name}`}
                              onClick={() => openEdit(role)}
                              size="sm"
                              variant="ghost"
                            >
                              <Pencil aria-hidden="true" className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
              />
            )}
          </CardContent>
        </Card>

        <FormDrawer
          description={
            editing
              ? "Ubah nama, deskripsi, dan izin peran."
              : "Tambahkan peran kustom dan pilih izinnya."
          }
          formId="role-form"
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          onOpenChange={setFormOpen}
          onSubmit={onSubmit}
          open={formOpen}
          title={editing ? "Ubah peran" : "Tambah peran"}
        >
          <Field
            error={errors.name?.message}
            htmlFor="role-name"
            label="Nama peran"
            required
          >
            <Input id="role-name" {...register("name")} />
          </Field>
          <Field
            description={
              editing?.isSystem
                ? "Kode peran bawaan tidak dapat diubah."
                : "Kode dipakai untuk pemetaan izin."
            }
            error={errors.code?.message}
            htmlFor="role-code"
            label="Kode"
            required
          >
            <Input
              disabled={editing?.isSystem}
              id="role-code"
              {...register("code")}
            />
          </Field>
          <Field
            error={errors.description?.message}
            htmlFor="role-description"
            label="Deskripsi"
          >
            <Textarea id="role-description" {...register("description")} />
          </Field>

          {canManagePermissions ? (
            <div className="flex flex-col gap-3 border-t border-border pt-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-label font-medium text-foreground">
                  Matriks izin
                </p>
                <span className="text-caption text-muted-foreground">
                  {selectedPermissions.length} dipilih
                </span>
              </div>
              {errors.permissionCodes?.message ? (
                <p className="text-caption font-medium text-danger-strong">
                  {errors.permissionCodes.message}
                </p>
              ) : null}
              {permissionGroups.map((group) => {
                const codes = group.permissions.map(
                  (permission) => permission.code,
                );
                const allSelected = codes.every((code) =>
                  selectedPermissions.includes(code),
                );
                return (
                  <fieldset
                    className="flex flex-col gap-2 rounded-md border border-border p-3"
                    key={group.label}
                  >
                    <legend className="sr-only">{group.label}</legend>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-label font-medium text-foreground">
                        {group.label}
                      </span>
                      <label
                        className="flex min-h-11 items-center gap-2 text-caption text-muted-foreground"
                        htmlFor={`role-group-${codes[0]}`}
                      >
                        <Checkbox
                          checked={allSelected}
                          id={`role-group-${codes[0]}`}
                          onChange={() => toggleGroup(codes)}
                        />
                        Pilih semua
                      </label>
                    </div>
                    <div className="grid gap-1 sm:grid-cols-2">
                      {group.permissions.map((permission) => (
                        <label
                          className="flex min-h-11 items-center gap-2 text-body text-foreground"
                          htmlFor={`role-permission-${permission.code}`}
                          key={permission.code}
                        >
                          <Checkbox
                            checked={selectedPermissions.includes(
                              permission.code,
                            )}
                            id={`role-permission-${permission.code}`}
                            onChange={() => togglePermission(permission.code)}
                          />
                          {permission.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
            </div>
          ) : (
            <p className="rounded-md border border-border bg-surface-subtle px-3 py-2 text-caption text-muted-foreground">
              Anda tidak dapat mengubah izin peran. Perubahan izin memerlukan
              izin permissions.manage.
            </p>
          )}

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
