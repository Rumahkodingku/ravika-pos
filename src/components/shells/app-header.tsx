"use client";

import { ChevronDown, KeyRound, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
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
import { ChangePasswordDialog } from "@/features/auth/change-password-dialog";
import { useSession } from "@/features/auth/session-provider";
import { cn } from "@/lib/cn";
import {
  megaMenuGroups,
  quickActions,
  quickNavigation,
} from "@/lib/navigation";
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
        "inline-flex min-h-11 items-center gap-2 rounded-md px-2.5 text-label font-medium text-muted-foreground transition-colors duration-(--motion-fast) ease-smooth hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
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

export function AppHeader({
  actions,
  fullWidth = false,
  logoutLabel = "Keluar",
  moduleLabel = "POS",
  onLogout,
}: {
  actions?: React.ReactNode;
  fullWidth?: boolean;
  logoutLabel?: string;
  moduleLabel?: string;
  onLogout?: () => void;
}) {
  const pathname = usePathname();
  const { user } = useSession();
  const { mutate: logout } = useLogoutMutation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const permissions = user?.permissions ?? [];
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
    permissions.includes(item.permission),
  );
  const visibleQuickActions = quickActions.filter((action) =>
    permissions.includes(action.permission),
  );
  const hasMenu = visibleGroups.length > 0 || visibleQuickActions.length > 0;
  const canViewDashboard = permissions.includes("dashboard.view");
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  const content = (
    <div
      className={cn(
        "flex items-center gap-2",
        fullWidth
          ? "min-h-[var(--ravika-header-height)] flex-wrap gap-y-1 py-2"
          : "h-[var(--ravika-header-height)]",
      )}
    >
      <Link
        className="flex shrink-0 items-center gap-2 rounded-md px-1 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        href="/app"
      >
        <BrandLogo priority size="lg" />
        <span className="text-lg font-bold tracking-tight text-foreground">
          RAVIKA
        </span>
        <span className="text-caption font-semibold text-primary-strong">
          {moduleLabel}
        </span>
      </Link>

      <nav
        aria-label="Navigasi utama"
        className="ml-2 hidden items-center gap-0.5 lg:flex"
      >
        {visibleQuickNavigation.map((item) => (
          <QuickNavLink item={item} key={item.href} pathname={pathname} />
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {actions}
        <ThemeToggle />
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
          <DropdownMenuItem onSelect={() => setPasswordOpen(true)}>
            <KeyRound aria-hidden="true" className="h-4 w-4" />
            Ubah kata sandi
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => {
              if (onLogout) {
                onLogout();
              } else {
                logout();
              }
            }}
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            {logoutLabel}
          </DropdownMenuItem>
        </DropdownMenu>
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
  );

  return (
    <>
      <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-surface">
        {fullWidth ? (
          <div className="px-4 sm:px-6">{content}</div>
        ) : (
          <Container size="wide">{content}</Container>
        )}
      </header>

      <MobileMenuSheet
        activePath={pathname}
        groups={visibleGroups}
        onOpenChange={setMobileNavOpen}
        open={mobileNavOpen}
        quickActions={visibleQuickActions}
      />

      <ChangePasswordDialog
        onOpenChange={setPasswordOpen}
        open={passwordOpen}
      />
    </>
  );
}
