"use client";

import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart, ChartContainer } from "@/components/ui/chart";
import { DatePicker } from "@/components/ui/date-picker";
import { PageHeader } from "@/components/ui/layout";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useSalesReportQuery,
  useTopProductsQuery,
} from "@/features/management/api/reports";
import { RequirePermission } from "@/features/management/permission-gate";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatDateKey,
  formatDateTime,
  formatNumber,
} from "@/lib/format";

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

export default function ReportsPage() {
  const [period, setPeriod] = useState("7d");
  const [customFrom, setCustomFrom] = useState(
    () => rangeDates("7d", "", "").from,
  );
  const [customTo, setCustomTo] = useState(() => rangeDates("7d", "", "").to);
  const dates = rangeDates(period, customFrom, customTo);
  const isCustomRangeInvalid =
    period === "custom" &&
    customFrom !== "" &&
    customTo !== "" &&
    customFrom > customTo;

  const { data, error, isLoading, refetch } = useSalesReportQuery({
    dateFrom: dates.from,
    dateTo: dates.to,
  });
  const topProductsQuery = useTopProductsQuery({
    dateFrom: dates.from,
    dateTo: dates.to,
    limit: 5,
  });
  const topProducts = topProductsQuery.data ?? data?.topProducts ?? [];

  return (
    <RequirePermission permission="reports.view">
      <div className="flex flex-col gap-6">
        <PageHeader
          description="Ringkasan penjualan dan produk terlaris. Bukan laporan akuntansi final."
          title="Laporan"
        />

        <Card>
          <CardContent className="flex flex-wrap items-end gap-2">
            <Select
              aria-label="Periode laporan"
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
                  aria-label="Tanggal mulai laporan"
                  className="w-40"
                  onChange={(event) => setCustomFrom(event.target.value)}
                  value={customFrom}
                />
                <DatePicker
                  aria-label="Tanggal akhir laporan"
                  className="w-40"
                  onChange={(event) => setCustomTo(event.target.value)}
                  value={customTo}
                />
              </>
            ) : null}
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {["a", "b", "c", "d"].map((key) => (
              <Skeleton className="h-28" key={key} />
            ))}
          </div>
        ) : error ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : isCustomRangeInvalid ? null : !data ? null : data.transactionCount ===
          0 ? (
          <EmptyState
            description="Belum ada transaksi pada periode ini. Ubah filter untuk melihat data lain."
            icon={BarChart3}
            title="Belum ada transaksi"
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card variant="stat">
                <CardContent className="flex flex-col gap-1">
                  <span className="text-caption text-muted-foreground">
                    Penjualan kotor
                  </span>
                  <span className="text-section-title tabular-nums text-foreground">
                    {formatCurrency(data.salesTotal)}
                  </span>
                </CardContent>
              </Card>
              <Card variant="stat">
                <CardContent className="flex flex-col gap-1">
                  <span className="text-caption text-muted-foreground">
                    Pembayaran diterima
                  </span>
                  <span className="text-section-title tabular-nums text-foreground">
                    {formatCurrency(data.paidTotal)}
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
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
              <ChartContainer
                description="Total penjualan harian dalam Rupiah."
                title="Tren penjualan"
              >
                <BarChart
                  ariaLabel="Grafik penjualan laporan"
                  data={data.salesTrend}
                  valueFormatter={formatCompactCurrency}
                />
              </ChartContainer>
              <Card>
                <CardHeader
                  description="Berdasarkan kuantitas item terjual."
                  title="Produk terlaris"
                />
                <CardContent className="flex flex-col gap-3">
                  {topProducts.length === 0 ? (
                    <p className="text-body text-muted-foreground">
                      Belum ada produk terjual pada periode ini.
                    </p>
                  ) : (
                    topProducts.map((product) => (
                      <div
                        className="flex items-center justify-between gap-2 text-body"
                        key={product.name}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {product.name}
                          </span>
                          <span className="text-caption text-muted-foreground">
                            {formatNumber(product.quantity)} terjual
                          </span>
                        </div>
                        <span className="tabular-nums text-foreground">
                          {formatCurrency(product.revenue)}
                        </span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader
                description="Pesanan non-cancelled pada periode terpilih."
                title="Tabel penjualan"
              />
              <CardContent className="p-0">
                <div className="hidden lg:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nomor</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Pembayaran</TableHead>
                        <TableHead>Persiapan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {formatDateTime(order.createdAt)}
                          </TableCell>
                          <TableCell>
                            {order.orderType === "DINE_IN"
                              ? "Dine-in"
                              : "Takeaway"}
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
                  {data.orders.map((order) => (
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
          </>
        )}
      </div>
    </RequirePermission>
  );
}
