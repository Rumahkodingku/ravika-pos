"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import type { ThemeMode } from "@/types/ui";

const labels: Record<ThemeMode, string> = {
  light: "Terang",
  dark: "Gelap",
  system: "Sistem",
};

const nextTheme: Record<ThemeMode, ThemeMode> = {
  light: "dark",
  dark: "system",
  system: "light",
};

const icons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = icons[theme];
  const next = nextTheme[theme];

  return (
    <Button
      aria-label={`Tema saat ini ${labels[theme]}. Ganti ke ${labels[next]}.`}
      className="shrink-0"
      onClick={() => setTheme(next)}
      size="icon"
      title={`Tema: ${labels[theme]}`}
      variant="ghost"
    >
      <Icon aria-hidden="true" className="h-5 w-5" />
    </Button>
  );
}
