"use client";

import { ChevronDown, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ShellTheme } from "@/components/shells/shell-theme";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Container } from "@/components/ui/layout";
import { MegaMenu } from "@/components/ui/mega-menu";
import { MobileMenuSheet } from "@/components/ui/mobile-menu-sheet";
import { useLogoutMutation } from "@/features/auth/api";
import { useSession } from "@/features/auth/session-provider";
import { cn } from "@/lib/cn";
import {
  megaMenuGroups,
  quickActions,
  quickNavigation,
} from "@/mocks/navigation";
import type { NavItem } from "@/types/ui";

function isActivePath(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

function QuickNavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const active = isActivePath(pathname, item.href);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-md px-2.5 text-label font-medium text-muted-foreground transition-colors duration-[var(--motion-fast)] ease-smooth hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
        active && "bg-surface-subtle text-foreground",
      )}
      href={item.href}
    >
      <Icon
        aria-hidden="true"
        className={cn("h-[18px] w-[18px]", active && "text-primary-strong")}
      />
      {item.label}
    </Link>
  );
}

export function ManagementShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSession();
  const { mutate: logout } = useLogoutMutation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const permissions = user?.permissions ?? [];
  const can = (permission: string) => permissions.includes(permission);

  const visibleGroups = useMemo(
    () =>
      megaMenuGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            permissions.includes(item.permission),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [permissions],
  );

  const visibleQuickNavigation = quickNavigation.filter((item) =>
    can(item.permission),
  );
  const visibleQuickActions = quickActions.filter((action) =>
    can(action.permission),
  );
  const hasMenu = visibleGroups.length > 0 || visibleQuickActions.length > 0;
  const canViewDashboard = can("dashboard.view");

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  const handleLogout = () => {
    logout();
  };

  return (
    <ShellTheme defaultTheme="system">
      <div className="flex min-h-dvh flex-col bg-background">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-md focus:border focus:border-border focus:bg-surface focus:px-4 focus:py-2 focus:text-body focus:text-foreground"
          href="#main-content"
        >
          Lewati ke konten utama
        </a>

        <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-surface">
          <Container size="wide">
            <div className="flex h-[var(--ravika-header-height)] items-center gap-2">
              <Link
                className="flex shrink-0 items-baseline gap-1.5 rounded-md px-1 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                href="/app"
              >
                <span className="text-lg font-bold tracking-tight text-foreground">
                  RAVIKA
                </span>
                <span className="text-caption font-semibold text-primary-strong">
                  POS
                </span>
              </Link>

              <nav
                aria-label="Navigasi utama"
                className="ml-2 hidden items-center gap-0.5 lg:flex"
              >
                {visibleQuickNavigation.map((item) => (
                  <QuickNavLink
                    item={item}
                    key={item.href}
                    pathname={pathname}
                  />
                ))}
              </nav>

              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <div className="hidden sm:block">
                  <DropdownMenu
                    trigger={
                      <span className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-action text-caption font-semibold text-primary-action-foreground">
                          {initials}
                        </span>
                        <span className="hidden max-w-28 truncate text-label xl:inline">
                          {user.name}
                        </span>
                        <ChevronDown aria-hidden="true" className="h-4 w-4" />
                      </span>
                    }
                    variant="ghost"
                  >
                    <DropdownMenuLabel>
                      <span className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="font-normal text-muted-foreground">
                          {user.roleLabel}
                        </span>
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => router.push("/app/design-system")}
                    >
                      <span className="flex h-4 w-4 items-center justify-center text-caption font-semibold">
                        UI
                      </span>
                      Design system
                      <Badge className="ml-auto" tone="neutral">
                        Internal
                      </Badge>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleLogout}>
                      <LogOut aria-hidden="true" className="h-4 w-4" />
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenu>
                </div>
                {hasMenu ? (
                  <>
                    <Button
                      aria-controls="mobile-menu-sheet"
                      aria-expanded={mobileNavOpen}
                      aria-haspopup="dialog"
                      aria-label="Buka navigasi"
                      className="lg:hidden"
                      onClick={() => setMobileNavOpen(true)}
                      size="icon"
                      variant="ghost"
                    >
                      <Menu aria-hidden="true" className="h-5 w-5" />
                    </Button>
                    <div className="hidden lg:block">
                      <MegaMenu
                        activePath={pathname}
                        groups={visibleGroups}
                        quickActions={visibleQuickActions}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-caption text-muted-foreground">
                    <span>Tidak ada menu</span>
                    {canViewDashboard ? (
                      <Link
                        className="font-medium text-primary-strong underline-offset-4 hover:underline"
                        href="/app"
                      >
                        Dashboard
                      </Link>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </Container>
        </header>

        <main className="flex-1 py-6" id="main-content">
          <Container size="wide">{children}</Container>
        </main>

        <footer className="border-t border-border py-4">
          <Container size="wide">
            <p className="text-caption text-muted-foreground">
              Mode UI dengan data simulasi. Sesi: {user.roleLabel}.
            </p>
          </Container>
        </footer>

        <MobileMenuSheet
          activePath={pathname}
          groups={visibleGroups}
          onOpenChange={setMobileNavOpen}
          open={mobileNavOpen}
          quickActions={visibleQuickActions}
        />
      </div>
    </ShellTheme>
  );
}
