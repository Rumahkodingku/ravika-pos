import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeScript } from "@/components/theme/theme-script";
import { ToastProvider } from "@/components/ui/toast";
import { MockSessionProvider } from "@/features/auth/mock-session";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RAVIKA POS",
    template: "%s | RAVIKA POS",
  },
  description: "POS self-hosted untuk operasional kafe dan UMKM.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#101828" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html data-scroll-behavior="smooth" lang="id" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${plusJakarta.variable} min-h-dvh bg-background font-sans text-foreground antialiased`}
      >
        <ToastProvider>
          <MockSessionProvider>{children}</MockSessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
