"use client";

import { ChevronDown, LogOut, Menu, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ShellTheme } from "@/components/shells/shell-theme";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Container } from "@/components/ui/layout";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { managementNavigation } from "@/mocks/navigation";
import { mockOutlets } from "@/mocks/outlets";
import { hasPermission, mockCurrentUser, mockUsers } from "@/mocks/session";
import type { Outlet, SessionUser } from "@/types/auth";
import type { NavItem } from "@/types/ui";

const primaryHrefs = [
  "/app",
  "/app/orders",
  "/app/pos",
  "/kds",
  "/app/products",
  "/app/reports",
];

function isActivePath(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const active = isActivePath(pathname, item.href);

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-label font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring motion-reduce:transition-none",
        active && "bg-muted text-foreground",
      )}
      href={item.href}
      onClick={onNavigate}
    >
      <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
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
      managementNavigation
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            hasPermission(currentUser, item.permission),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [currentUser],
  );

  const allItems = visibleGroups.flatMap((group) => group.items);
  const primaryItems = allItems.filter((item) =>
    primaryHrefs.includes(item.href),
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
        <header className="sticky top-0 z-[var(--z-sticky)] border-b border-border bg-background/95 backdrop-blur">
          <Container size="wide">
            <div className="flex h-16 items-center gap-3">
              <Link
                className="flex shrink-0 items-baseline gap-1.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                href="/app"
              >
                <span className="text-lg font-bold tracking-tight text-foreground">
                  RAVIKA
                </span>
                <span className="text-caption font-semibold text-primary">
                  POS
                </span>
              </Link>

              <nav
                aria-label="Navigasi utama"
                className="ml-4 hidden items-center gap-0.5 lg:flex"
              >
                {primaryItems.map((item) => (
                  <NavLink item={item} key={item.href} pathname={pathname} />
                ))}
                <DropdownMenu
                  size="sm"
                  trigger={
                    <>
                      Menu
                      <ChevronDown aria-hidden="true" className="h-4 w-4" />
                    </>
                  }
                  variant="ghost"
                >
                  {visibleGroups.map((group) => (
                    <div key={group.label}>
                      <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem
                            key={item.href}
                            onSelect={() => router.push(item.href)}
                          >
                            <Icon aria-hidden="true" className="h-4 w-4" />
                            {item.label}
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  ))}
                </DropdownMenu>
              </nav>

              <div className="ml-auto flex items-center gap-2">
                <div className="hidden sm:block">
                  <Select
                    aria-label="Outlet aktif"
                    className="h-9 min-w-40 text-label"
                    onChange={(event) =>
                      setSelectedOutletId(event.target.value)
                    }
                    value={activeOutlet?.id ?? ""}
                  >
                    {availableOutlets.map((outlet) => (
                      <option key={outlet.id} value={outlet.id}>
                        {outlet.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <ThemeToggle />
                <DropdownMenu
                  className="hidden sm:inline-flex"
                  trigger={
                    <span className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-caption font-semibold text-primary-foreground">
                        {initials}
                      </span>
                      <span className="hidden max-w-28 truncate text-label md:inline">
                        {currentUser.name}
                      </span>
                      <ChevronDown aria-hidden="true" className="h-4 w-4" />
                    </span>
                  }
                  variant="ghost"
                >
                  <DropdownMenuLabel>
                    {currentUser.name} · {currentUser.roleLabel}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => showSoon("Profil pengguna")}
                  >
                    <UserRound aria-hidden="true" className="h-4 w-4" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => showSoon("Keluar")}>
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Pratinjau role (mock)</DropdownMenuLabel>
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
              </div>
            </div>
          </Container>
        </header>

        <main className="flex-1 py-6">
          <Container size="wide">{children}</Container>
        </main>

        <footer className="border-t border-border py-4">
          <Container size="wide">
            <p className="text-caption text-muted-foreground">
              RAVIKA POS · Mode UI · Data mock · {currentUser.roleLabel}
            </p>
          </Container>
        </footer>

        <Drawer
          onOpenChange={setMobileNavOpen}
          open={mobileNavOpen}
          side="left"
          title="Navigasi"
        >
          <nav aria-label="Navigasi mobile" className="flex flex-col gap-5">
            {visibleGroups.map((group) => (
              <div className="flex flex-col gap-1" key={group.label}>
                <p className="px-3 text-caption font-medium uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <NavLink
                    item={item}
                    key={item.href}
                    onNavigate={() => setMobileNavOpen(false)}
                    pathname={pathname}
                  />
                ))}
              </div>
            ))}
          </nav>
        </Drawer>
      </div>
    </ShellTheme>
  );
}
