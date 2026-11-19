"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/layout";
import { Textarea } from "@/components/ui/textarea";
import { useSetupMutation, useSetupStatusQuery } from "@/features/setup/api";
import {
  POST_SETUP_URL_KEY,
  useRestartRequired,
} from "@/features/system/restart-required";

const setupSchema = z
  .object({
    address: z.string().trim().max(240),
    businessCode: z
      .string()
      .trim()
      .regex(/^[A-Za-z0-9]{2,10}$/, "Kode bisnis 2 sampai 10 karakter.")
      .transform((value) => value.toUpperCase()),
    businessName: z.string().trim().min(1, "Nama bisnis wajib diisi.").max(120),
    confirmPassword: z
      .string()
      .min(8, "Konfirmasi kata sandi minimal 8 karakter."),
    ownerEmail: z.string().trim().email("Format email tidak valid."),
    ownerName: z.string().trim().min(1, "Nama owner wajib diisi.").max(120),
    ownerPassword: z.string().min(8, "Kata sandi minimal 8 karakter."),
    ownerUsername: z
      .string()
      .trim()
      .min(2, "Username minimal 2 karakter.")
      .max(40)
      .optional()
      .or(z.literal("")),
    phone: z.string().trim().max(32),
  })
  .strict()
  .refine((value) => value.ownerPassword === value.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok.",
    path: ["confirmPassword"],
  });

type SetupValues = z.infer<typeof setupSchema>;

const emptyValues: SetupValues = {
  address: "Jakarta Selatan",
  businessCode: "RVK",
  businessName: "",
  confirmPassword: "",
  ownerEmail: "",
  ownerName: "",
  ownerPassword: "",
  ownerUsername: "",
  phone: "021-000000",
};

export default function SetupPage() {
  const router = useRouter();
  const { requireRestart } = useRestartRequired();
  const statusQuery = useSetupStatusQuery();
  const setup = useSetupMutation();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<SetupValues>({
    defaultValues: emptyValues,
    resolver: zodResolver(setupSchema),
  });

  useEffect(() => {
    if (statusQuery.data && !statusQuery.data.setupRequired) {
      router.replace("/login");
    }
  }, [router, statusQuery.data]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await setup.mutateAsync(values);

      if (result.redirectUrl) {
        window.localStorage.setItem(POST_SETUP_URL_KEY, result.redirectUrl);
      } else {
        window.localStorage.removeItem(POST_SETUP_URL_KEY);
      }

      requireRestart();
    } catch (reason) {
      setError("root", {
        message: reason instanceof Error ? reason.message : "Instalasi gagal.",
      });
    }
  });

  if (statusQuery.isLoading) {
    return <LoadingState message="Memeriksa instalasi..." />;
  }

  if (statusQuery.error) {
    return <ErrorState onRetry={() => void statusQuery.refetch()} />;
  }

  if (!statusQuery.data?.setupRequired) {
    return <LoadingState message="Mengalihkan ke login..." />;
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-6 px-6 py-10">
      <div className="flex items-center gap-3">
        <BrandLogo priority size="lg" />
        <span className="text-2xl font-bold tracking-tight text-foreground">
          RAVIKA POS
        </span>
      </div>
      <PageHeader
        description="Buat akun pemilik dan profil bisnis untuk memulai."
        title="Instalasi awal RAVIKA POS"
      />
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <p className="text-body text-muted-foreground">
            Kunci QR dibuat otomatis dan disimpan di .env. Restart aplikasi
            setelah instalasi selesai.
          </p>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <Field
              error={errors.businessName?.message}
              htmlFor="setup-business-name"
              label="Nama bisnis"
              required
            >
              <Input id="setup-business-name" {...register("businessName")} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                error={errors.businessCode?.message}
                htmlFor="setup-business-code"
                label="Kode bisnis"
                required
              >
                <Input id="setup-business-code" {...register("businessCode")} />
              </Field>
              <Field
                error={errors.phone?.message}
                htmlFor="setup-phone"
                label="Telepon"
              >
                <Input id="setup-phone" {...register("phone")} />
              </Field>
            </div>
            <Field
              error={errors.address?.message}
              htmlFor="setup-address"
              label="Alamat"
            >
              <Textarea id="setup-address" {...register("address")} />
            </Field>
            <Field
              error={errors.ownerName?.message}
              htmlFor="setup-owner-name"
              label="Nama owner"
              required
            >
              <Input id="setup-owner-name" {...register("ownerName")} />
            </Field>
            <Field
              error={errors.ownerEmail?.message}
              htmlFor="setup-owner-email"
              label="Email owner"
              required
            >
              <Input
                id="setup-owner-email"
                type="email"
                {...register("ownerEmail")}
              />
            </Field>
            <Field
              error={errors.ownerUsername?.message}
              htmlFor="setup-owner-username"
              label="Username owner"
            >
              <Input id="setup-owner-username" {...register("ownerUsername")} />
            </Field>
            <Field
              error={errors.ownerPassword?.message}
              htmlFor="setup-owner-password"
              label="Kata sandi owner"
              required
            >
              <Input
                id="setup-owner-password"
                type="password"
                {...register("ownerPassword")}
              />
            </Field>
            <Field
              error={errors.confirmPassword?.message}
              htmlFor="setup-confirm-password"
              label="Konfirmasi kata sandi"
              required
            >
              <Input
                id="setup-confirm-password"
                type="password"
                {...register("confirmPassword")}
              />
            </Field>
            {errors.root?.message ? (
              <p
                className="rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-body text-danger-strong"
                role="alert"
              >
                {errors.root.message}
              </p>
            ) : null}
            <Button isLoading={isSubmitting} type="submit">
              Selesaikan instalasi
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
