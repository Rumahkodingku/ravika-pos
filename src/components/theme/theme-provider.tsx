"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ResolvedTheme, ThemeMode } from "@/types/ui";

const STORAGE_KEY = "ravika-theme";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: ThemeMode): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}) {
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(
    defaultTheme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    const nextTheme: ThemeMode =
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system"
        ? storedTheme
        : defaultTheme;

    const nextResolvedTheme = resolveTheme(nextTheme);
    setThemeState(nextTheme);
    setResolvedTheme(nextResolvedTheme);
    applyTheme(nextResolvedTheme);
  }, [defaultTheme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme !== "system") {
        return;
      }

      const nextResolvedTheme = getSystemTheme();
      setResolvedTheme(nextResolvedTheme);
      applyTheme(nextResolvedTheme);
    };

    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (nextTheme) => {
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        const nextResolvedTheme = resolveTheme(nextTheme);
        setThemeState(nextTheme);
        setResolvedTheme(nextResolvedTheme);
        applyTheme(nextResolvedTheme);
      },
    }),
    [resolvedTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}

export function ThemeScript({
  defaultTheme = "system",
}: {
  defaultTheme?: ThemeMode;
}) {
  const script = `
    (function () {
      try {
        var key = "${STORAGE_KEY}";
        var stored = window.localStorage.getItem(key);
        var theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "${defaultTheme}";
        var isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.classList.toggle("dark", isDark);
      } catch (error) {
        document.documentElement.classList.remove("dark");
      }
    })();
  `;

  // biome-ignore lint/security/noDangerouslySetInnerHtml: static theme bootstrap script
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
