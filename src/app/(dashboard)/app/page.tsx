"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChefHat, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { BarChart, ChartContainer } from "@/components/ui/chart";
import { DatePicker } from "@/components/ui/date-picker";
import { PageHeader, Section } from "@/components/ui/layout";
import { Select } from "@/components/ui/select";
import { ServiceFlow } from "@/components/ui/service-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardQuery } from "@/features/management/api/reports";
import {
  PermissionGate,
  RequirePermission,
} from "@/features/management/permission-gate";
import { useNow } from "@/features/operational/use-now";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatDateKey,
  formatDateTime,
  formatElapsed,
  formatNumber,
} from "@/lib/format";
import { preparationStatusConfig } from "@/lib/status";
import type { Order } from "@/types/domain";

function rangeDates(period: string, customFrom: string, customTo: string) {
  const today = formatDateKey(new Date());
  const daysAgo = (days: number) => {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - days);
    return formatDateKey(date);
  };
  const fallback = { from: daysAgo(6), to: today };

  if (period === "today") {
    return { from: today, to: today };
  }
  if (period === "7d") {
    return fallback;
  }
  if (period === "30d") {
    return { from: daysAgo(29), to: today };
  }
  return {
    from: customFrom || fallback.from,
    to: customTo || fallback.to,
  };
}

export default function DashboardPage() {
  const [period, setPeriod] = useState("today");
  const [customFrom, setCustomFrom] = useState(
    () => rangeDates("today", "", "").from,
  );
  const [customTo, setCustomTo] = useState(
    () => rangeDates("today", "", "").to,
  );
  const [source, setSource] = useState("all");
  const [orderType, setOrderType] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [orderStatus, setOrderStatus] = useState("all");
  const now = useNow();
  const dates = rangeDates(period, customFrom, customTo);
  const isCustomRangeInvalid =
    period === "custom" &&
    customFrom !== "" &&
    customTo !== "" &&
    customFrom > customTo;
  const filters = useMemo(
    () => ({
      dateFrom: period === "custom" ? customFrom || undefined : undefined,
      dateTo: period === "custom" ? customTo || undefined : undefined,
      orderStatus: orderStatus === "all" ? undefined : orderStatus,
      orderType: orderType === "all" ? undefined : orderType,
      paymentStatus: paymentStatus === "all" ? undefined : paymentStatus,
      range: period,
      source: source === "all" ? undefined : source,
    }),
    [
      customFrom,
      customTo,
      orderStatus,
      orderType,
      paymentStatus,
      period,
      source,
    ],
  );
  const { data, error, isLoading, refetch } = useDashboardQuery(
    filters,
    !isCustomRangeInvalid,
  );

  const totalActive =
    data?.queue.reduce((total, item) => total + item.count, 0) ?? 0;

  const recentOrderColumns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.orderNumber}</span>
      ),
      header: "Nomor",
    },
    {
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDateTime(row.original.createdAt)}
        </span>
      ),
      header: "Waktu",
    },
    {
      accessorKey: "grandTotal",
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatCurrency(row.original.grandTotal)}
        </span>
      ),
      header: "Total",
      meta: { cellClassName: "text-right", className: "text-right" },
    },
    {
      accessorKey: "paymentStatus",
      cell: ({ row }) => (
        <StatusBadge kind="payment" status={row.original.paymentStatus} />
      ),
      header: "Pembayaran",
    },
    {
      accessorKey: "orderStatus",
      cell: ({ row }) => (
        <StatusBadge kind="preparation" status={row.original.orderStatus} />
      ),
      header: "Persiapan",
    },
  ];

  return (
    <RequirePermission permission="dashboard.view">
      <div className="flex flex-col gap-8">
        <PageHeader
          actions={
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
          }
          description="Ringkasan operasional sesuai periode."
          eyebrow={now ? formatDate(now) : ""}
          title="Dashboard"
        />

        <Card>
          <CardContent className="flex flex-wrap items-end gap-2">
            <Select
              aria-label="Periode dashboard"
              className="w-40"
              onChange={(event) => setPeriod(event.target.value)}
              value={period}
            >
              <option value="today">Hari ini</option>
              <option value="7d">7 hari</option>
              <option value="30d">30 hari</option>
              <option value="custom">Kustom</option>
            </Select>
            {period === "custom" ? (
              <>
                <DatePicker
                  aria-label="Tanggal mulai dashboard"
                  className="w-40"
                  onChange={(event) => setCustomFrom(event.target.value)}
                  value={customFrom}
                />
                <DatePicker
                  aria-label="Tanggal akhir dashboard"
                  className="w-40"
                  onChange={(event) => setCustomTo(event.target.value)}
                  value={customTo}
                />
              </>
            ) : null}
            <Select
              aria-label="Sumber pesanan"
              className="w-40"
              onChange={(event) => setSource(event.target.value)}
              value={source}
            >
              <option value="all">Semua sumber</option>
              <option value="CASHIER">Kasir</option>
              <option value="QR">QR</option>
            </Select>
            <Select
              aria-label="Tipe pesanan"
              className="w-40"
              onChange={(event) => setOrderType(event.target.value)}
              value={orderType}
            >
              <option value="all">Semua tipe</option>
              <option value="DINE_IN">Dine-in</option>
              <option value="TAKEAWAY">Takeaway</option>
            </Select>
            <Select
              aria-label="Status pembayaran"
              className="w-40"
              onChange={(event) => setPaymentStatus(event.target.value)}
              value={paymentStatus}
            >
              <option value="all">Semua pembayaran</option>
              <option value="UNPAID">Belum dibayar</option>
              <option value="PARTIALLY_PAID">Dibayar sebagian</option>
              <option value="PAID">Lunas</option>
              <option value="REFUNDED">Refund</option>
            </Select>
            <Select
              aria-label="Status persiapan"
              className="w-40"
              onChange={(event) => setOrderStatus(event.target.value)}
              value={orderStatus}
            >
              <option value="all">Semua persiapan</option>
              <option value="NEW">Baru</option>
              <option value="ACCEPTED">Diterima</option>
              <option value="PREPARING">Disiapkan</option>
              <option value="READY">Siap</option>
              <option value="COMPLETED">Selesai</option>
              <option value="CANCELLED">Dibatalkan</option>
            </Select>
            {isCustomRangeInvalid ? (
              <p className="text-caption text-danger-strong" role="alert">
                Tanggal mulai harus sebelum tanggal akhir.
              </p>
            ) : (
              <p className="text-caption text-muted-foreground">
                Periode {formatDate(dates.from)} sampai {formatDate(dates.to)}.
              </p>
            )}
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
          <ErrorState onRetry={() => void refetch()} />
        ) : isCustomRangeInvalid ? null : !data ? null : data.transactionCount ===
          0 ? (
          <EmptyState
            description="Belum ada transaksi pada filter ini. Ubah filter untuk melihat data lain."
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
                description="Total penjualan harian dalam Rupiah."
                title="Tren penjualan"
              >
                <BarChart
                  ariaLabel="Grafik penjualan tujuh hari"
                  data={data.salesTrend}
                  valueFormatter={formatCompactCurrency}
                />
              </ChartContainer>

              <Card className="flex flex-col">
                <CardHeader
                  description="Status persiapan dan tiket aktif pada periode ini."
                  title="Antrean pesanan"
                />
                <CardContent className="flex flex-1 flex-col gap-4">
                  <ServiceFlow
                    layout="grid"
                    steps={data.queue.map((item) => ({
                      id: item.status,
                      label: item.label,
                      count: item.count,
                      tone: preparationStatusConfig[item.status].tone,
                      state: item.count > 0 ? "active" : "upcoming",
                    }))}
                  />

                  <div className="flex flex-1 flex-col gap-2 border-t border-border pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-label font-medium text-foreground">
                        Tiket tertua
                      </p>
                      <p className="text-caption text-muted-foreground">
                        {data.queueOrders.length} dari {totalActive} pesanan
                        aktif
                      </p>
                    </div>

                    {data.queueOrders.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border p-6 text-center">
                        <ChefHat
                          aria-hidden="true"
                          className="h-5 w-5 text-muted-foreground"
                        />
                        <p className="text-body font-medium text-foreground">
                          Tidak ada pesanan aktif
                        </p>
                        <p className="max-w-sm text-caption text-muted-foreground">
                          Belum ada pesanan yang perlu disiapkan pada periode
                          ini.
                        </p>
                      </div>
                    ) : (
                      <ul className="flex flex-col divide-y divide-border">
                        {data.queueOrders.map((order) => (
                          <li
                            className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                            key={order.id}
                          >
                            <div className="flex min-w-0 flex-col gap-0.5">
                              <span className="truncate text-body font-medium text-foreground">
                                {order.orderNumber}
                              </span>
                              <span className="text-caption text-muted-foreground">
                                {order.orderType === "DINE_IN"
                                  ? `Dine-in, ${order.tableName ?? "Tanpa meja"}`
                                  : "Takeaway"}
                                {now
                                  ? `, ${formatElapsed(order.createdAt, now)}`
                                  : ""}
                              </span>
                            </div>
                            <StatusBadge
                              kind="preparation"
                              status={order.orderStatus}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="justify-between gap-3">
                  <span className="text-caption text-muted-foreground">
                    Total aktif: {totalActive} pesanan
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
                description="Pesanan terbaru dengan status pembayaran dan persiapan terpisah."
                title="Pesanan terbaru"
              >
                <Card>
                  <CardContent className="p-0">
                    <div className="hidden lg:block">
                      <DataTable
                        columns={recentOrderColumns}
                        data={data.recentOrders}
                        getRowId={(order) => order.id}
                      />
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
                            {formatDateTime(order.createdAt)}
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
