"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Store } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorState } from "@/components/feedback/error-state";
import { useTheme } from "@/components/theme/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Field, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/layout";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { RequirePermission } from "@/features/management/permission-gate";
import { useAsyncData, useManagementStore } from "@/mocks/management/hooks";
import { managementService } from "@/mocks/management/service";

const settingsSchema = z.object({
  name: z.string().min(1, "Nama bisnis wajib diisi."),
  code: z
    .string()
    .min(3, "Kode bisnis minimal 3 karakter.")
    .max(10, "Kode bisnis maksimal 10 karakter."),
  address: z.string(),
  phone: z.string(),
  theme: z.enum(["light", "dark", "system"]),
  timeZone: z.literal("Asia/Jakarta"),
});

type SettingsValues = z.infer<typeof settingsSchema>;

const emptySettings: SettingsValues = {
  name: "",
  code: "",
  address: "",
  phone: "",
  theme: "system",
  timeZone: "Asia/Jakarta",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();
  const outlets = useManagementStore((state) => state.outlets);
  const { data, error, isLoading, refresh } = useAsyncData(
    () => managementService.getBusiness(),
    "business",
  );

  const themeRef = useRef(theme);
  themeRef.current = theme;

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<SettingsValues>({
    defaultValues: emptySettings,
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    if (data) {
      reset({
        name: data.name,
        code: data.code,
        address: data.address,
        phone: data.phone,
        theme: themeRef.current,
        timeZone: "Asia/Jakarta",
      });
    }
  }, [data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await managementService.updateBusiness({
        name: values.name,
        code: values.code,
        address: values.address,
        phone: values.phone,
      });
      setTheme(values.theme);
      toast({ title: "Pengaturan disimpan", tone: "success" });
      refresh();
    } catch (reason) {
      setError("root", {
        message:
          reason instanceof Error
            ? reason.message
            : "Pengaturan gagal disimpan.",
      });
    }
  });

  return (
    <RequirePermission permission="settings.manage">
      <div className="flex flex-col gap-6">
        <PageHeader
          actions={<Badge tone="neutral">Data simulasi</Badge>}
          description="Profil bisnis dan preferensi tampilan."
          title="Pengaturan"
        />

        {isLoading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        ) : error ? (
          <ErrorState onRetry={refresh} />
        ) : (
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={onSubmit}>
            <Card>
              <CardHeader
                description="Nama dan kontak yang tampil di aplikasi."
                title="Profil bisnis"
              />
              <CardContent className="flex flex-col gap-4">
                <Field
                  error={errors.name?.message}
                  htmlFor="settings-name"
                  label="Nama bisnis"
                  required
                >
                  <Input id="settings-name" {...register("name")} />
                </Field>
                <Field
                  error={errors.code?.message}
                  htmlFor="settings-code"
                  label="Kode bisnis"
                  required
                >
                  <Input id="settings-code" {...register("code")} />
                </Field>
                <Field
                  error={errors.address?.message}
                  htmlFor="settings-address"
                  label="Alamat"
                >
                  <Textarea id="settings-address" {...register("address")} />
                </Field>
                <Field
                  error={errors.phone?.message}
                  htmlFor="settings-phone"
                  label="Telepon"
                >
                  <Input id="settings-phone" {...register("phone")} />
                </Field>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader
                  description="Preferensi ini tersimpan di perangkat, bukan di server."
                  title="Tampilan"
                />
                <CardContent className="flex flex-col gap-4">
                  <Field
                    error={errors.theme?.message}
                    htmlFor="settings-theme"
                    label="Tema"
                  >
                    <Select id="settings-theme" {...register("theme")}>
                      <option value="system">Ikuti sistem</option>
                      <option value="light">Terang</option>
                      <option value="dark">Gelap</option>
                    </Select>
                  </Field>
                  <Field
                    description="Nilai pilot, belum final (OPEN-003)."
                    error={errors.timeZone?.message}
                    htmlFor="settings-timezone"
                    label="Zona waktu"
                  >
                    <Select
                      disabled
                      id="settings-timezone"
                      {...register("timeZone")}
                    >
                      <option value="Asia/Jakarta">Asia/Jakarta</option>
                    </Select>
                  </Field>
                  <Field
                    description="Mata uang transaksi. Belum dapat diubah."
                    htmlFor="settings-currency"
                    label="Format mata uang"
                  >
                    <Input disabled id="settings-currency" value="IDR" />
                  </Field>
                  <FieldDescription>
                    Pajak, diskon, dan biaya layanan belum tersedia di Fase 2.
                  </FieldDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader
                  action={<Badge tone="neutral">Data simulasi</Badge>}
                  description="Ringkasan outlet yang terdaftar."
                  title="Ringkasan outlet"
                />
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-subtle text-muted-foreground">
                      <Store aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-card-title tabular-nums text-foreground">
                        {outlets.length} outlet
                      </span>
                      <span className="text-caption text-muted-foreground">
                        {
                          outlets.filter((outlet) => outlet.isActive !== false)
                            .length
                        }{" "}
                        aktif
                      </span>
                    </div>
                  </div>
                  <Link
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                    href="/app/outlets"
                  >
                    Kelola outlet
                  </Link>
                </CardContent>
              </Card>
            </div>

            {errors.root?.message ? (
              <p
                className="rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-body text-danger-strong lg:col-span-2"
                role="alert"
              >
                {errors.root.message}
              </p>
            ) : null}
            <div className="flex justify-end lg:col-span-2">
              <Button isLoading={isSubmitting} type="submit">
                Simpan pengaturan
              </Button>
            </div>
          </form>
        )}
      </div>
    </RequirePermission>
  );
}
