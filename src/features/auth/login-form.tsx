"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input, PasswordInput } from "@/components/ui/input";
import { useLoginMutation } from "@/features/auth/api";
import { apiFetch } from "@/lib/api/client";

const loginSchema = z.object({
  identity: z.string().min(1, "Email atau username wajib diisi."),
  password: z.string().min(6, "Kata sandi minimal 6 karakter."),
  remember: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

const genericError = "Email, username, atau kata sandi tidak cocok.";

export function LoginForm() {
  const login = useLoginMutation();
  const router = useRouter();

  useEffect(() => {
    let active = true;

    void apiFetch<{ setupRequired: boolean }>("/setup/status")
      .then((status) => {
        if (active && status.setupRequired) {
          router.replace("/setup");
        }
      })
      .catch(() => {
        // Keep login usable if setup status cannot be loaded.
      });

    return () => {
      active = false;
    };
  }, [router]);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginValues>({
    defaultValues: { identity: "", password: "", remember: false },
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync({
        identity: values.identity.trim(),
        password: values.password,
        remember: values.remember,
      });
    } catch {
      setError("root", { message: genericError });
    }
  });

  return (
    <form className="flex min-w-0 flex-col gap-4" onSubmit={onSubmit}>
      <Field
        error={errors.identity?.message}
        htmlFor="login-identity"
        label="Email atau username"
        required
      >
        <Input
          aria-invalid={errors.identity ? true : undefined}
          autoComplete="username"
          id="login-identity"
          placeholder="nama@ravika.id"
          type="text"
          {...register("identity")}
        />
      </Field>
      <Field
        error={errors.password?.message}
        htmlFor="login-password"
        label="Kata sandi"
        required
      >
        <PasswordInput
          aria-invalid={errors.password ? true : undefined}
          autoComplete="current-password"
          id="login-password"
          placeholder="Masukkan kata sandi"
          {...register("password")}
        />
      </Field>
      <label
        className="flex min-h-11 items-center gap-2 text-body text-muted-foreground"
        htmlFor="remember-session"
      >
        <Checkbox id="remember-session" {...register("remember")} />
        Ingat sesi di perangkat ini
      </label>
      {errors.root?.message ? (
        <p
          className="rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-body text-danger-strong"
          role="alert"
        >
          {errors.root.message}
        </p>
      ) : null}
      <Button className="w-full" isLoading={isSubmitting} type="submit">
        Masuk
      </Button>
    </form>
  );
}
