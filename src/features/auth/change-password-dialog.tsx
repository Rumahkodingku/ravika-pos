"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useChangePasswordMutation } from "@/features/auth/api";
import { ApiError } from "@/lib/api/errors";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi."),
    newPassword: z.string().min(8, "Kata sandi baru minimal 8 karakter."),
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi kata sandi baru wajib diisi."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Kata sandi baru tidak cocok.",
    path: ["confirmPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const formId = useId();
  const { toast } = useToast();
  const changePassword = useChangePasswordMutation();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ChangePasswordValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    resolver: zodResolver(changePasswordSchema),
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset();
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast({
        title: "Kata sandi diperbarui",
        description: "Sesi lain pada akun ini telah dikeluarkan.",
        tone: "success",
      });
      handleOpenChange(false);
    } catch (error) {
      setError("root", {
        message:
          error instanceof ApiError
            ? error.detail
            : "Kata sandi gagal diubah. Coba lagi.",
      });
    }
  });

  return (
    <Dialog
      description="Sesi ini tetap aktif setelah kata sandi diubah."
      footer={
        <>
          <Button onClick={() => handleOpenChange(false)} variant="outline">
            Batal
          </Button>
          <Button
            form={formId}
            isLoading={isSubmitting}
            type="submit"
            variant="primary"
          >
            Simpan
          </Button>
        </>
      }
      onOpenChange={handleOpenChange}
      open={open}
      size="sm"
      title="Ubah kata sandi"
    >
      <form className="flex flex-col gap-4" id={formId} onSubmit={onSubmit}>
        <Field
          error={errors.currentPassword?.message}
          htmlFor="change-password-current"
          label="Kata sandi saat ini"
          required
        >
          <Input
            autoComplete="current-password"
            id="change-password-current"
            type="password"
            {...register("currentPassword")}
          />
        </Field>
        <Field
          description="Minimal 8 karakter."
          error={errors.newPassword?.message}
          htmlFor="change-password-new"
          label="Kata sandi baru"
          required
        >
          <Input
            autoComplete="new-password"
            id="change-password-new"
            type="password"
            {...register("newPassword")}
          />
        </Field>
        <Field
          error={errors.confirmPassword?.message}
          htmlFor="change-password-confirm"
          label="Konfirmasi kata sandi baru"
          required
        >
          <Input
            autoComplete="new-password"
            id="change-password-confirm"
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
      </form>
    </Dialog>
  );
}
