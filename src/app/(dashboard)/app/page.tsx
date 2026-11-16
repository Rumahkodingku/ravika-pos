import { ArrowUpRight, ChefHat, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { BarChart, ChartContainer, Sparkline } from "@/components/ui/chart";
import { PageHeader, Section } from "@/components/ui/layout";
import { OrderMobileCard } from "@/components/ui/order-mobile-card";
import { ServiceFlow } from "@/components/ui/service-flow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDateTime,
  formatNumber,
} from "@/lib/format";
import {
  queueSteps,
  recentOrders,
  salesTrend,
  todaySales,
  topProducts,
} from "@/mocks/dashboard";

const maxProductQuantity = Math.max(
  ...topProducts.map((product) => product.quantity),
  1,
);

const maxSalesValue = Math.max(...salesTrend.map((item) => item.value), 1);
const activeOrderCount = queueSteps.reduce(
  (total, step) => total + (step.count ?? 0),
  0,
);

function SalesTrendList() {
  return (
    <Card className="md:hidden">
      <CardHeader
        action={<Badge tone="neutral">Data simulasi</Badge>}
        description="Total penjualan harian dalam Rupiah."
        title="Penjualan 7 hari"
      />
      <CardContent className="flex flex-col gap-3 p-4">
        {salesTrend.map((item) => (
          <div className="flex flex-col gap-1" key={item.label}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-caption text-muted-foreground">
                {item.label}
              </span>
              <span className="text-caption font-medium tabular-nums text-foreground">
                {formatCurrency(item.value)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(item.value / maxSalesValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        actions={
          <>
            <Badge tone="neutral">Data simulasi</Badge>
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
          </>
        }
        description="Ringkasan operasional hari ini."
        eyebrow="Hari ini, 16 November 2026"
        title="Dashboard"
      />

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Card>
          <CardContent className="flex flex-col gap-5 p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-label text-muted-foreground">
                  Penjualan hari ini
                </p>
                <p className="text-display tabular-nums text-foreground">
                  {formatCurrency(todaySales.value)}
                </p>
                <p className="flex items-center gap-1 text-caption text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-medium text-success-strong">
                    <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                    {todaySales.change}
                  </span>
                  {todaySales.comparison}
                </p>
              </div>
            </div>

            <Sparkline
              ariaLabel="Tren penjualan hari ini per jam"
              className="w-full max-w-none"
              data={todaySales.sparkline}
            />

            <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-caption text-muted-foreground">
                  Transaksi
                </span>
                <span className="text-card-title tabular-nums text-foreground">
                  {formatNumber(todaySales.transactions)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-caption text-muted-foreground">
                  Rata-rata
                </span>
                <span className="text-card-title tabular-nums text-foreground">
                  {formatCurrency(todaySales.average)}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-caption text-muted-foreground">
                  Item terjual
                </span>
                <span className="text-card-title tabular-nums text-foreground">
                  {formatNumber(todaySales.itemsSold)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            action={<Badge tone="info">Data contoh</Badge>}
            description="Status persiapan pesanan saat ini."
            title="Antrean sekarang"
          />
          <CardContent className="flex flex-col gap-5 p-4 sm:p-5">
            <ServiceFlow steps={queueSteps} />
            <div className="rounded-md border border-border bg-surface-subtle px-3 py-2.5">
              <p className="text-body font-medium text-foreground">
                3 pesanan siap diambil
              </p>
              <p className="text-caption text-muted-foreground">
                Cek antrean KDS sebelum menyerahkan pesanan.
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-between gap-3">
            <span className="text-caption text-muted-foreground">
              Total aktif: {activeOrderCount} pesanan
            </span>
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
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <ChartContainer
          className="hidden md:flex"
          description="Total penjualan harian dalam Rupiah. Data simulasi."
          title="Penjualan 7 hari"
        >
          <BarChart
            ariaLabel="Grafik penjualan tujuh hari"
            data={salesTrend}
            valueFormatter={formatCompactCurrency}
          />
        </ChartContainer>
        <SalesTrendList />

        <Card>
          <CardHeader
            action={<Badge tone="neutral">Data contoh</Badge>}
            description="Berdasarkan kuantitas terjual."
            title="Produk terlaris"
          />
          <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
            {topProducts.map((product) => (
              <div className="flex flex-col gap-1.5" key={product.name}>
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-body font-medium text-foreground">
                    {product.name}
                  </span>
                  <span className="shrink-0 text-caption tabular-nums text-muted-foreground">
                    {formatNumber(product.quantity)} terjual
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${(product.quantity / maxProductQuantity) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-caption tabular-nums text-muted-foreground">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

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
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.number}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(order.time)}
                      </TableCell>
                      <TableCell>{order.outlet}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(order.total)}
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
                          status={order.preparationStatus}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col gap-2 p-3 lg:hidden">
              {recentOrders.map((order) => (
                <OrderMobileCard key={order.id} order={order} />
              ))}
            </div>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
