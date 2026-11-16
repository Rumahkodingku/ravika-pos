"use client";

import { ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
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
import { OutletSwitcher } from "@/components/ui/outlet-switcher";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import {
  megaMenuGroups,
  quickActions,
  quickNavigation,
} from "@/mocks/navigation";
import { mockOutlets } from "@/mocks/outlets";
import { hasPermission, mockCurrentUser, mockUsers } from "@/mocks/session";
import type { Outlet, SessionUser } from "@/types/auth";
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

function allowedOutlets(user: SessionUser, outlets: Outlet[]) {
  return outlets.filter((outlet) => user.outletIds.includes(outlet.id));
}

export function ManagementShell({
  children,
  outlets = mockOutlets,
  user = mockCurrentUser,
}: {
  children: React.ReactNode;
  outlets?: Outlet[];
  user?: SessionUser;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [selectedOutletId, setSelectedOutletId] = useState(
    allowedOutlets(user, outlets)[0]?.id ?? "",
  );

  const visibleGroups = useMemo(
    () =>
      megaMenuGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            hasPermission(currentUser, item.permission),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [currentUser],
  );

  const visibleQuickNavigation = quickNavigation.filter((item) =>
    hasPermission(currentUser, item.permission),
  );
  const visibleQuickActions = quickActions.filter((action) =>
    hasPermission(currentUser, action.permission),
  );
  const availableOutlets = allowedOutlets(currentUser, outlets);
  const activeOutlet =
    availableOutlets.find((outlet) => outlet.id === selectedOutletId) ??
    availableOutlets[0];

  const initials = currentUser.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  const changeRole = (nextUser: SessionUser) => {
    setCurrentUser(nextUser);
    setSelectedOutletId(allowedOutlets(nextUser, outlets)[0]?.id ?? "");
    toast({
      title: `Mode pratinjau: ${nextUser.roleLabel}`,
      description: "Data sesi masih mock sampai backend tersedia.",
      tone: "info",
    });
  };

  const showSoon = (label: string) => {
    toast({
      title: label,
      description: "Aksi ini akan tersedia pada fase berikutnya.",
      tone: "info",
    });
  };

  return (
    <ShellTheme defaultTheme="system">
      <div className="flex min-h-dvh flex-col bg-background">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-md focus:border focus:border-border focus:bg-surface focus:px-4 focus:py-2 focus:text-body focus:text-foreground focus:shadow-overlay"
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
                <div className="hidden md:block">
                  <OutletSwitcher
                    onChange={setSelectedOutletId}
                    outlets={availableOutlets}
                    value={activeOutlet?.id ?? ""}
                  />
                </div>
                <ThemeToggle />
                <DropdownMenu
                  className="hidden sm:inline-flex"
                  trigger={
                    <span className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-action text-caption font-semibold text-primary-action-foreground">
                        {initials}
                      </span>
                      <span className="hidden max-w-28 truncate text-label xl:inline">
                        {currentUser.name}
                      </span>
                      <ChevronDown aria-hidden="true" className="h-4 w-4" />
                    </span>
                  }
                  variant="ghost"
                >
                  <DropdownMenuLabel>
                    <span className="flex flex-col">
                      <span>{currentUser.name}</span>
                      <span className="font-normal text-muted-foreground">
                        {currentUser.roleLabel}
                      </span>
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => showSoon("Profil pengguna")}
                  >
                    <UserRound aria-hidden="true" className="h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
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
                  <DropdownMenuItem onSelect={() => showSoon("Keluar")}>
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Pratinjau role mock</DropdownMenuLabel>
                  {mockUsers.map((mockUser) => (
                    <DropdownMenuItem
                      key={mockUser.id}
                      onSelect={() => changeRole(mockUser)}
                    >
                      {mockUser.roleLabel}
                      {mockUser.id === currentUser.id ? (
                        <Badge className="ml-auto" tone="primary">
                          Aktif
                        </Badge>
                      ) : null}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenu>
                <Button
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
              Mode UI dengan data simulasi. Sesi: {currentUser.roleLabel}.
            </p>
          </Container>
        </footer>

        <MobileMenuSheet
          activePath={pathname}
          groups={visibleGroups}
          onOpenChange={setMobileNavOpen}
          onOutletChange={setSelectedOutletId}
          open={mobileNavOpen}
          outlets={availableOutlets}
          quickActions={visibleQuickActions}
          selectedOutletId={activeOutlet?.id ?? ""}
        />
      </div>
    </ShellTheme>
  );
}
