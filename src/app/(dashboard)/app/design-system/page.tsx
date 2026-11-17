"use client";

import { Inbox, Info, Package, Palette, Plus } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { OfflineState } from "@/components/feedback/offline-state";
import { PermissionDeniedState } from "@/components/feedback/permission-denied-state";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  BarChart,
  ChartContainer,
  LineChart,
  Sparkline,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { Input, SearchInput } from "@/components/ui/input";
import { PageHeader, Section } from "@/components/ui/layout";
import { MegaMenu } from "@/components/ui/mega-menu";
import { Pagination } from "@/components/ui/pagination";
import { QuantityControl } from "@/components/ui/quantity-control";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { ServiceFlow } from "@/components/ui/service-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";
import { MockControls } from "@/features/management/mock-controls";
import { TableQrCode } from "@/features/management/table-qr-code";
import { TableSkeleton } from "@/features/management/table-skeleton";
import { formatCurrency } from "@/lib/format";
import { megaMenuGroups, quickActions } from "@/mocks/navigation";

const chartData = [
  { label: "Sen", value: 12 },
  { label: "Sel", value: 18 },
  { label: "Rab", value: 9 },
  { label: "Kam", value: 22 },
  { label: "Jum", value: 28 },
  { label: "Sab", value: 34 },
];

const tableRows = [
  { number: "KMG-0248", total: 128000, status: "PAID" as const },
  { number: "KMG-0247", total: 76000, status: "PARTIALLY_PAID" as const },
  { number: "SNP-0119", total: 54000, status: "UNPAID" as const },
];

const flowSteps = [
  {
    id: "new",
    label: "Baru",
    count: 12,
    state: "complete" as const,
    tone: "primary" as const,
  },
  {
    id: "accepted",
    label: "Diterima",
    count: 8,
    state: "complete" as const,
    tone: "teal" as const,
  },
  {
    id: "preparing",
    label: "Disiapkan",
    count: 6,
    state: "current" as const,
    tone: "warning" as const,
  },
  {
    id: "ready",
    label: "Siap",
    count: 3,
    state: "upcoming" as const,
    tone: "success" as const,
  },
];

const tokenSwatches = [
  { name: "Primary action", token: "var(--ravika-primary-action)" },
  { name: "Primary", token: "var(--ravika-primary)" },
  { name: "Success", token: "var(--ravika-success)" },
  { name: "Warning", token: "var(--ravika-warning)" },
  { name: "Danger", token: "var(--ravika-danger)" },
  { name: "Info", token: "var(--ravika-info)" },
  { name: "Teal", token: "var(--ravika-teal)" },
  { name: "Surface", token: "var(--ravika-surface)" },
  { name: "Surface subtle", token: "var(--ravika-surface-subtle)" },
  { name: "Border", token: "var(--ravika-border)" },
  { name: "Inverse", token: "var(--ravika-surface-inverse)" },
];

export default function DesignSystemPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [radioValue, setRadioValue] = useState("dine-in");
  const [quantity, setQuantity] = useState(1);
  const [page, setPage] = useState(2);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        actions={<Badge tone="info">Internal</Badge>}
        description="Pratinjau komponen, token, theme, dan state untuk QA internal."
        eyebrow="Frontend foundation"
        title="Design system"
      />

      <Section
        description="Semantic color, type scale, dan spacing yang dipakai aplikasi."
        title="Tokens"
      >
        <Card>
          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {tokenSwatches.map((swatch) => (
                <div className="flex flex-col gap-1.5" key={swatch.name}>
                  <span
                    aria-hidden="true"
                    className="h-12 rounded-md border border-border"
                    style={{ backgroundColor: swatch.token }}
                  />
                  <span className="text-caption font-medium text-foreground">
                    {swatch.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid gap-2 border-t border-border pt-4">
              <p className="text-display text-foreground">Display 32</p>
              <p className="text-page-title text-foreground">Page title 28</p>
              <p className="text-section-title text-foreground">
                Section title 20
              </p>
              <p className="text-card-title text-foreground">Card title 16</p>
              <p className="text-body text-foreground">Body 14</p>
              <p className="text-label text-foreground">Label 13</p>
              <p className="text-caption text-muted-foreground">Caption 12</p>
            </div>
            <div className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
              {[1, 2, 3, 4, 6, 8].map((step) => (
                <div className="flex flex-col items-center gap-1" key={step}>
                  <span
                    aria-hidden="true"
                    className="bg-primary/30"
                    style={{ height: `${step * 4}px`, width: `${step * 4}px` }}
                  />
                  <span className="text-caption text-muted-foreground">
                    {step * 4}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section
        description="Panel navigasi full-width dengan grup dan aksi cepat."
        title="Mega menu"
      >
        <Card>
          <CardContent className="flex flex-col gap-3">
            <p className="text-body text-muted-foreground">
              Klik tombol Menu untuk membuka panel. Gunakan Tab dan Escape untuk
              menguji keyboard.
            </p>
            <div className="flex min-h-11 items-center">
              <MegaMenu
                activePath="/app/design-system"
                groups={megaMenuGroups}
                quickActions={quickActions}
              />
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section
        description="Motif service flow untuk dashboard, KDS, dan status pesanan."
        title="Service flow"
      >
        <Card>
          <CardContent className="flex flex-col gap-6">
            <ServiceFlow steps={flowSteps} />
            <ServiceFlow orientation="vertical" steps={flowSteps} />
          </CardContent>
        </Card>
      </Section>

      <Section
        description="Varian, ukuran, state loading, dan ikon."
        title="Button"
      >
        <Card>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link</Button>
            <Button isLoading>Memproses</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} variant="outline">
              Tambah
            </Button>
            <Button size="sm" variant="outline">
              Small
            </Button>
            <Button size="lg">Large</Button>
          </CardContent>
        </Card>
      </Section>

      <Section
        description="Input, select, checkbox, radio, switch, dan quantity."
        title="Form controls"
      >
        <Card>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field
              description="Gunakan email atau username internal."
              htmlFor="demo-name"
              label="Nama pengguna"
            >
              <Input id="demo-name" placeholder="Nama lengkap" />
            </Field>
            <Field htmlFor="demo-search" label="Pencarian">
              <SearchInput id="demo-search" placeholder="Cari produk…" />
            </Field>
            <Field htmlFor="demo-select" label="Outlet">
              <Select defaultValue="kemang" id="demo-select">
                <option value="kemang">RAVIKA Kemang</option>
                <option value="senopati">RAVIKA Senopati</option>
              </Select>
            </Field>
            <Field htmlFor="demo-date" label="Tanggal">
              <DatePicker id="demo-date" />
            </Field>
            <Field htmlFor="demo-notes" label="Catatan">
              <Textarea id="demo-notes" placeholder="Catatan pesanan…" />
            </Field>
            <div className="flex flex-col gap-4">
              <label
                className="flex min-h-11 items-center gap-2 text-body text-muted-foreground"
                htmlFor="demo-checkbox"
              >
                <Checkbox defaultChecked id="demo-checkbox" />
                Aktifkan produk
              </label>
              <Switch
                checked={switchOn}
                description="Simulasi preferensi lokal."
                label="Mode pratinjau"
                onCheckedChange={setSwitchOn}
              />
            </div>
            <RadioGroup
              label="Tipe pesanan"
              name="demo-order-type"
              onValueChange={setRadioValue}
              options={[
                {
                  label: "Dine-in",
                  value: "dine-in",
                  description: "Pilih meja setelah ini.",
                },
                {
                  label: "Takeaway",
                  value: "takeaway",
                  description: "Tanpa meja.",
                },
              ]}
              value={radioValue}
            />
            <div className="flex flex-col gap-2">
              <span className="text-label font-medium text-foreground">
                Kuantitas
              </span>
              <QuantityControl onChange={setQuantity} value={quantity} />
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section
        description="Badge semantic dan status pembayaran/persiapan."
        title="Badges"
      >
        <Card>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Badge>Neutral</Badge>
            <Badge tone="primary">Primary</Badge>
            <Badge tone="success">Success</Badge>
            <Badge tone="warning">Warning</Badge>
            <Badge tone="danger">Danger</Badge>
            <Badge tone="info">Info</Badge>
            <Badge tone="teal">Teal</Badge>
            <StatusBadge kind="payment" status="PAID" />
            <StatusBadge kind="payment" status="UNPAID" />
            <StatusBadge kind="preparation" status="ACCEPTED" />
            <StatusBadge kind="preparation" status="READY" />
            <StatusBadge kind="preparation" status="CANCELLED" />
          </CardContent>
        </Card>
      </Section>

      <Section
        description="Default, stat, surface-subtle, dan interactive."
        title="Cards dan table"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <Card className="p-4" variant="default">
            <p className="text-label text-muted-foreground">Default card</p>
            <p className="text-page-title text-foreground">12</p>
          </Card>
          <Card className="p-4" variant="stat">
            <p className="text-label text-muted-foreground">Stat card</p>
            <p className="text-page-title text-foreground">Rp 128.000</p>
          </Card>
          <Card className="p-4" variant="interactive">
            <p className="text-label text-muted-foreground">Interactive card</p>
            <p className="text-card-title text-foreground">Klik untuk detail</p>
          </Card>
        </div>
        <Card>
          <CardHeader
            title="Contoh tabel"
            description="Status pembayaran terpisah dari persiapan."
          />
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pembayaran</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableRows.map((row) => (
                  <TableRow key={row.number}>
                    <TableCell>{row.number}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(row.total)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge kind="payment" status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Pagination onPageChange={setPage} page={page} pageCount={8} />
      </Section>

      <Section
        description="Tabs, tooltip, dialog, drawer, dan toast."
        title="Overlay dan feedback"
      >
        <Card>
          <CardContent className="flex flex-col gap-5">
            <Tabs defaultValue="ringkasan">
              <TabsList>
                <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
                <TabsTrigger value="detail">Detail</TabsTrigger>
                <TabsTrigger value="riwayat">Riwayat</TabsTrigger>
              </TabsList>
              <TabsContent value="ringkasan">
                <p className="text-body text-muted-foreground">
                  Konten ringkasan.
                </p>
              </TabsContent>
              <TabsContent value="detail">
                <p className="text-body text-muted-foreground">
                  Konten detail.
                </p>
              </TabsContent>
              <TabsContent value="riwayat">
                <p className="text-body text-muted-foreground">
                  Konten riwayat.
                </p>
              </TabsContent>
            </Tabs>
            <div className="flex flex-wrap gap-2">
              <Tooltip content="Tooltip muncul saat hover atau fokus.">
                <Button variant="outline">Tooltip</Button>
              </Tooltip>
              <Button onClick={() => setDialogOpen(true)} variant="outline">
                Buka dialog
              </Button>
              <Button onClick={() => setDrawerOpen(true)} variant="outline">
                Buka drawer
              </Button>
              <Button
                onClick={() =>
                  toast({
                    title: "Perubahan disimpan",
                    description: "Toast ini hanya simulasi frontend.",
                    tone: "success",
                  })
                }
                variant="outline"
              >
                Tampilkan toast
              </Button>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section description="Chart SVG tanpa library eksternal." title="Charts">
        <div className="grid gap-4 xl:grid-cols-2">
          <ChartContainer description="Bar chart contoh." title="Bar chart">
            <BarChart ariaLabel="Bar chart contoh" data={chartData} />
          </ChartContainer>
          <ChartContainer description="Line chart contoh." title="Line chart">
            <LineChart ariaLabel="Line chart contoh" data={chartData} />
          </ChartContainer>
        </div>
        <ChartContainer description="Sparkline ringkas." title="Sparkline">
          <Sparkline ariaLabel="Sparkline contoh" data={chartData} />
        </ChartContainer>
      </Section>

      <Section
        description="Pola tabel, QR, dan kontrol mock untuk QA internal."
        title="Pola management"
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader
              description="Skeleton mempertahankan kolom tabel."
              title="Table skeleton"
            />
            <CardContent className="p-0">
              <TableSkeleton columns={4} rows={5} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader
              description="Pratinjau QR palsu yang deterministik."
              title="QR placeholder"
            />
            <CardContent>
              <TableQrCode label="Meja 01" token="tbl-demo" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader
            description="Latensi, error berikutnya, dan reset data mock."
            title="Mock controls"
          />
          <CardContent>
            <MockControls />
          </CardContent>
        </Card>
      </Section>

      <Section
        description="Loading, empty, error, permission, offline, dan skeleton."
        title="States"
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader title="Loading" />
            <CardContent>
              <LoadingState />
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Empty" />
            <CardContent>
              <EmptyState
                description="Belum ada data."
                icon={Inbox}
                title="Kosong"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Error" />
            <CardContent>
              <ErrorState
                onRetry={() => toast({ title: "Retry", tone: "info" })}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Permission" />
            <CardContent>
              <PermissionDeniedState />
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Offline" />
            <CardContent>
              <OfflineState />
            </CardContent>
          </Card>
          <Card>
            <CardHeader title="Skeleton" />
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Card variant="surface-subtle">
        <CardContent className="flex items-center gap-3 text-body text-muted-foreground">
          <Palette aria-hidden="true" className="h-5 w-5 text-primary" />
          <Info aria-hidden="true" className="h-5 w-5 text-primary" />
          <Package aria-hidden="true" className="h-5 w-5 text-primary" />
          Komponen ini memakai token semantic, bukan nilai warna mentah.
        </CardContent>
      </Card>

      <Dialog
        description="Dialog memakai elemen native dan focus management bawaan."
        footer={<Button onClick={() => setDialogOpen(false)}>Mengerti</Button>}
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        title="Contoh dialog"
      >
        <p className="text-body text-muted-foreground">
          Konten dialog singkat untuk konfirmasi atau form kecil.
        </p>
      </Dialog>

      <Drawer
        description="Drawer untuk mobile cart atau detail sekunder."
        footer={<Button onClick={() => setDrawerOpen(false)}>Tutup</Button>}
        onOpenChange={setDrawerOpen}
        open={drawerOpen}
        side="right"
        title="Contoh drawer"
      >
        <p className="text-body text-muted-foreground">
          Konten drawer dapat berisi detail pesanan atau keranjang.
        </p>
      </Drawer>
    </div>
  );
}
