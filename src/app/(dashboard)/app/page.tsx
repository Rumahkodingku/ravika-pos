"use client";

import { ChefHat, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { BarChart, ChartContainer } from "@/components/ui/chart";
import { PageHeader, Section } from "@/components/ui/layout";
import { Select } from "@/components/ui/select";
import { ServiceFlow } from "@/components/ui/service-flow";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMockSession } from "@/features/auth/mock-session";
import {
  PermissionGate,
  RequirePermission,
} from "@/features/management/permission-gate";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "@/lib/format";
import { useAsyncData, useManagementStore } from "@/mocks/management/hooks";
import { managementService } from "@/mocks/management/service";

export default function DashboardPage() {
  const { user } = useMockSession();
  const allOutlets = useManagementStore((state) => state.outlets);
  const outlets = allOutlets.filter((outlet) =>
    user?.outletIds.includes(outlet.id),
  );
  const [range, setRange] = useState("today");
  const [outletId, setOutletId] = useState("all");
  const { data, error, isLoading, refresh } = useAsyncData(
    () => managementService.getDashboard({ outletId, range }),
    JSON.stringify([outletId, range]),
  );

  const outletName = (id: string) =>
    outlets.find((outlet) => outlet.id === id)?.name ?? "Tidak ada";

  return (
    <RequirePermission permission="dashboard.view">
      <div className="flex flex-col gap-8">
        <PageHeader
          actions={
            <>
              <Badge tone="neutral">Data simulasi</Badge>
              <PermissionGate permission="orders.create">
                <Link
                  className={buttonVariants({
                    variant: "primary",
                    size: "sm",
                    className: "h-11 sm:h-9",
                  })}
                  href="/app/pos"
                >
                  <ShoppingCart aria-hidden="true" className="h-4 w-4" />
                  Buat pesanan
                </Link>
              </PermissionGate>
            </>
          }
          description="Ringkasan operasional sesuai periode dan outlet."
          eyebrow="16 November 2026"
          title="Dashboard"
        />

        <Card>
          <CardContent className="flex flex-wrap items-end gap-2">
            <Select
              aria-label="Periode dashboard"
              className="w-40"
              onChange={(event) => setRange(event.target.value)}
              value={range}
            >
              <option value="today">Hari ini</option>
              <option value="7d">7 hari</option>
              <option value="30d">30 hari</option>
            </Select>
            <Select
              aria-label="Outlet dashboard"
              className="w-48"
              onChange={(event) => setOutletId(event.target.value)}
              value={outletId}
            >
              <option value="all">Semua outlet</option>
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </Select>
            <p className="text-caption text-muted-foreground">
              Angka dihitung dari pesanan dan pembayaran contoh.
            </p>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {["a", "b", "c", "d"].map((key) => (
                <Skeleton className="h-28" key={key} />
              ))}
            </div>
            <Skeleton className="h-72" />
          </div>
        ) : error ? (
          <ErrorState onRetry={refresh} />
        ) : !data ? null : data.transactionCount === 0 ? (
          <EmptyState
            description="Belum ada transaksi pada periode dan outlet ini. Ubah filter untuk melihat data lain."
            icon={ShoppingCart}
            title="Belum ada transaksi"
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card variant="stat">
                <CardContent className="flex flex-col gap-1">
                  <span className="text-caption text-muted-foreground">
                    Penjualan periode
                  </span>
                  <span className="text-section-title tabular-nums text-foreground">
                    {formatCurrency(data.salesTotal)}
                  </span>
                  <span className="text-caption text-muted-foreground">
                    Pembayaran diterima {formatCurrency(data.paidTotal)}
                  </span>
                </CardContent>
              </Card>
              <Card variant="stat">
                <CardContent className="flex flex-col gap-1">
                  <span className="text-caption text-muted-foreground">
                    Jumlah transaksi
                  </span>
                  <span className="text-section-title tabular-nums text-foreground">
                    {formatNumber(data.transactionCount)}
                  </span>
                </CardContent>
              </Card>
              <Card variant="stat">
                <CardContent className="flex flex-col gap-1">
                  <span className="text-caption text-muted-foreground">
                    Rata-rata transaksi
                  </span>
                  <span className="text-section-title tabular-nums text-foreground">
                    {formatCurrency(data.averageTransaction)}
                  </span>
                </CardContent>
              </Card>
              <Card variant="stat">
                <CardContent className="flex flex-col gap-1">
                  <span className="text-caption text-muted-foreground">
                    Item terjual
                  </span>
                  <span className="text-section-title tabular-nums text-foreground">
                    {formatNumber(data.itemsSold)}
                  </span>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
              <ChartContainer
                description="Total penjualan harian dalam Rupiah. Data simulasi."
                title="Tren penjualan"
              >
                <BarChart
                  ariaLabel="Grafik penjualan tujuh hari"
                  data={data.salesTrend}
                  valueFormatter={formatCompactCurrency}
                />
              </ChartContainer>

              <Card>
                <CardHeader
                  action={<Badge tone="info">Data contoh</Badge>}
                  description="Status persiapan pesanan pada periode ini."
                  title="Antrean persiapan"
                />
                <CardContent className="flex flex-col gap-4">
                  <ServiceFlow
                    steps={data.queue.map((item) => ({
                      id: item.status,
                      label: item.label,
                      count: item.count,
                      state:
                        item.status === "NEW"
                          ? "current"
                          : item.count > 0
                            ? "upcoming"
                            : "complete",
                    }))}
                  />
                </CardContent>
                <CardFooter className="justify-between gap-3">
                  <span className="text-caption text-muted-foreground">
                    Total aktif:{" "}
                    {data.queue.reduce((total, item) => total + item.count, 0)}{" "}
                    pesanan
                  </span>
                  <PermissionGate permission="kds.view">
                    <Link
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className: "h-11 sm:h-9",
                      })}
                      href="/kds"
                    >
                      <ChefHat aria-hidden="true" className="h-4 w-4" />
                      Buka KDS
                    </Link>
                  </PermissionGate>
                </CardFooter>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
              <Section
                action={
                  <Link
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                      className: "h-11 sm:h-9",
                    })}
                    href="/app/orders"
                  >
                    Lihat semua pesanan
                  </Link>
                }
                description="Contoh pesanan terbaru dengan status pembayaran dan persiapan terpisah."
                title="Pesanan terbaru"
              >
                <Card>
                  <CardContent className="p-0">
                    <div className="hidden lg:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nomor</TableHead>
                            <TableHead>Waktu</TableHead>
                            <TableHead>Outlet</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Pembayaran</TableHead>
                            <TableHead>Persiapan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.recentOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">
                                {order.orderNumber}
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-muted-foreground">
                                {formatDateTime(order.createdAt)}
                              </TableCell>
                              <TableCell>
                                {outletName(order.outletId)}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">
                                {formatCurrency(order.grandTotal)}
                              </TableCell>
                              <TableCell>
                                <StatusBadge
                                  kind="payment"
                                  status={order.paymentStatus}
                                />
                              </TableCell>
                              <TableCell>
                                <StatusBadge
                                  kind="preparation"
                                  status={order.orderStatus}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex flex-col gap-2 p-3 lg:hidden">
                      {data.recentOrders.map((order) => (
                        <div
                          className="flex flex-col gap-1 rounded-md border border-border p-3"
                          key={order.id}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-body font-medium text-foreground">
                              {order.orderNumber}
                            </span>
                            <span className="text-body tabular-nums text-foreground">
                              {formatCurrency(order.grandTotal)}
                            </span>
                          </div>
                          <span className="text-caption text-muted-foreground">
                            {formatDateTime(order.createdAt)}.{" "}
                            {outletName(order.outletId)}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            <StatusBadge
                              kind="payment"
                              status={order.paymentStatus}
                            />
                            <StatusBadge
                              kind="preparation"
                              status={order.orderStatus}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Section>

              <Card>
                <CardHeader
                  action={<Badge tone="neutral">Data contoh</Badge>}
                  description="Berdasarkan kuantitas terjual."
                  title="Produk terlaris"
                />
                <CardContent className="flex flex-col gap-4">
                  {data.topProducts.length === 0 ? (
                    <p className="text-body text-muted-foreground">
                      Belum ada produk terjual pada periode ini.
                    </p>
                  ) : (
                    data.topProducts.map((product) => (
                      <div className="flex flex-col gap-1.5" key={product.name}>
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-body font-medium text-foreground">
                            {product.name}
                          </span>
                          <span className="shrink-0 text-caption tabular-nums text-muted-foreground">
                            {formatNumber(product.quantity)} terjual
                          </span>
                        </div>
                        <span className="text-caption tabular-nums text-muted-foreground">
                          {formatCurrency(product.revenue)}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </RequirePermission>
  );
}
