import {
  ArrowUpRight,
  BarChart3,
  Monitor,
  Palette,
  ReceiptText,
  ShoppingBag,
  Store,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart, ChartContainer, LineChart } from "@/components/ui/chart";
import { PageHeader, Section } from "@/components/ui/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDateTime, formatNumber } from "@/lib/format";
import {
  dashboardStats,
  orderStatusTrend,
  recentOrders,
  salesTrend,
} from "@/mocks/dashboard";

const previewLinks = [
  { href: "/login", label: "Login", icon: ArrowUpRight },
  { href: "/app/pos", label: "POS", icon: Monitor },
  { href: "/kds", label: "KDS", icon: BarChart3 },
  { href: "/menu/kemang-meja-01", label: "Menu pelanggan", icon: ShoppingBag },
  { href: "/order/demo", label: "Status pesanan", icon: ReceiptText },
  { href: "/app/design-system", label: "Design system", icon: Palette },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        actions={
          <>
            <Badge tone="info">Data mock</Badge>
            <Link
              className={buttonVariants({
                variant: "primary",
                size: "sm",
                className: "h-11 sm:h-9",
              })}
              href="/app/pos"
            >
              Buat pesanan
            </Link>
          </>
        }
        description="Ringkasan operasional hari ini. Semua angka masih data simulasi."
        eyebrow="RAVIKA Kemang"
        title="Dashboard"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card className="p-4 sm:p-5" key={stat.label} variant="stat">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-label text-muted-foreground">{stat.label}</p>
                <Badge tone={stat.change === "3 siap" ? "info" : "success"}>
                  {stat.change}
                </Badge>
              </div>
              <p className="text-page-title tabular-nums text-foreground">
                {stat.format === "currency"
                  ? formatCurrency(stat.value)
                  : formatNumber(stat.value)}
              </p>
              <p className="text-caption text-muted-foreground">{stat.hint}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <ChartContainer
          description="Total penjualan harian dalam Rupiah."
          title="Penjualan 7 hari"
        >
          <BarChart ariaLabel="Grafik penjualan tujuh hari" data={salesTrend} />
        </ChartContainer>
        <ChartContainer
          description="Jumlah pesanan berdasarkan status persiapan."
          title="Status pesanan"
        >
          <LineChart
            ariaLabel="Grafik status pesanan"
            data={orderStatusTrend}
          />
        </ChartContainer>
      </div>

      <Section
        description="Contoh pesanan terbaru dengan status pembayaran dan persiapan terpisah."
        title="Pesanan terbaru"
      >
        <Card>
          <CardHeader
            action={
              <Link
                className={buttonVariants({ variant: "outline", size: "sm" })}
                href="/app/orders"
              >
                Lihat semua
              </Link>
            }
            title="Daftar pesanan"
          />
          <CardContent className="p-0">
            {recentOrders.length === 0 ? (
              <EmptyState
                className="m-4"
                description="Pesanan baru akan muncul di sini."
                icon={ReceiptText}
                title="Belum ada pesanan"
              />
            ) : (
              <>
                <p className="border-b border-border px-4 py-2 text-caption text-muted-foreground sm:hidden">
                  Geser ke samping untuk melihat status pembayaran dan
                  persiapan.
                </p>
                <Table className="min-w-[760px]">
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
              </>
            )}
          </CardContent>
        </Card>
      </Section>

      <Section
        description="Tautan sementara untuk memeriksa shell dan halaman placeholder Fase 1."
        title="Pratinjau shell"
      >
        <Card variant="surface-subtle">
          <CardContent className="flex flex-wrap gap-2">
            {previewLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                  })}
                  href={item.href}
                  key={item.href}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              className={buttonVariants({ variant: "ghost", size: "sm" })}
              href="/app/settings"
            >
              <Store aria-hidden="true" className="h-4 w-4" />
              Pengaturan
            </Link>
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
