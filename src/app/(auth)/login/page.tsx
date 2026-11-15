"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login belum tersedia",
        description:
          "Autentikasi nyata akan diimplementasikan pada fase backend.",
        tone: "info",
      });
    }, 600);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader
        action={<Badge tone="info">Fase 2</Badge>}
        description="Masuk untuk mengelola operasional bisnis."
        title="Masuk ke RAVIKA POS"
      />
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field htmlFor="login-identity" label="Email atau username">
            <Input
              autoComplete="username"
              id="login-identity"
              placeholder="nama@ravika.id"
              required
              type="text"
            />
          </Field>
          <Field htmlFor="login-password" label="Kata sandi">
            <Input
              autoComplete="current-password"
              id="login-password"
              placeholder="Masukkan kata sandi"
              required
              type="password"
            />
          </Field>
          <label
            className="flex items-center gap-2 text-body text-muted-foreground"
            htmlFor="remember-session"
          >
            <Checkbox id="remember-session" />
            Ingat sesi di perangkat ini
          </label>
          <Button className="w-full" isLoading={isLoading} type="submit">
            Masuk
          </Button>
          <p className="text-center text-caption text-muted-foreground">
            Form ini hanya simulasi UI. Tidak ada kredensial yang dikirim.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
