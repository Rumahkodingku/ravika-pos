"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  landingPathForRole,
  useMockSession,
} from "@/features/auth/mock-session";
import { mockUsers } from "@/mocks/session";

const loginSchema = z.object({
  identity: z.string().min(1, "Email atau username wajib diisi."),
  password: z.string().min(6, "Kata sandi minimal 6 karakter."),
});

type LoginValues = z.infer<typeof loginSchema>;

const demoAccounts = mockUsers.map((user) => ({
  role: user.roleLabel,
  email: user.email,
  username: user.username,
  landing: landingPathForRole(user.role),
}));

export function LoginForm() {
  const router = useRouter();
  const { isReady, login, user } = useMockSession();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<LoginValues>({
    defaultValues: { identity: "", password: "" },
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isReady && user) {
      router.replace(landingPathForRole(user.role));
    }
  }, [isReady, router, user]);

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    const success = login(values.identity, values.password);

    if (!success) {
      setError("root", {
        message: "Email, username, atau kata sandi tidak cocok.",
      });
      return;
    }

    const match = mockUsers.find(
      (candidate) =>
        candidate.email === values.identity.trim().toLowerCase() ||
        candidate.username === values.identity.trim().toLowerCase(),
    );

    router.replace(landingPathForRole(match?.role ?? "OWNER"));
  });

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
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
          <Input
            aria-invalid={errors.password ? true : undefined}
            autoComplete="current-password"
            id="login-password"
            placeholder="Masukkan kata sandi"
            type="password"
            {...register("password")}
          />
        </Field>
        <label
          className="flex min-h-11 items-center gap-2 text-body text-muted-foreground"
          htmlFor="remember-session"
        >
          <Checkbox id="remember-session" />
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

      <div className="flex flex-col gap-3 border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-label font-medium text-foreground">Akun demo</p>
          <Badge tone="warning">Mode UI, bukan autentikasi nyata</Badge>
        </div>
        <ul className="flex flex-col divide-y divide-border">
          {demoAccounts.map((account) => (
            <li
              className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
              key={account.email}
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-label font-medium text-foreground">
                  {account.role}
                </span>
                <span className="break-words text-caption text-muted-foreground">
                  {account.email} atau {account.username}. Kata sandi demo123.
                </span>
              </div>
              <Button
                onClick={() => {
                  setValue("identity", account.email, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("password", "demo123", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                size="sm"
                variant="outline"
              >
                Isi akun
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
