"use client";

import { Wallet } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Drawer } from "@/components/ui/drawer";
import { PageHeader } from "@/components/ui/layout";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMockSession } from "@/features/auth/mock-session";
import { DataTableToolbar } from "@/features/management/data-table-toolbar";
import { OrderDetailDrawer } from "@/features/management/order-detail-drawer";
import { RequirePermission } from "@/features/management/permission-gate";
import { ResponsiveList } from "@/features/management/responsive-list";
import { TablePagination } from "@/features/management/table-pagination";
import { TableSkeleton } from "@/features/management/table-skeleton";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useAsyncData, useManagementStore } from "@/mocks/management/hooks";
import { managementService } from "@/mocks/management/service";
import type { Order, Payment, PaymentMethod } from "@/types/domain";

const methodLabels: Record<PaymentMethod, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  E_WALLET: "Dompet digital",
};

export default function PaymentsPage() {
  const { user } = useMockSession();
  const allOutlets = useManagementStore((state) => state.outlets);
  const outlets = allOutlets.filter((outlet) =>
    user?.outletIds.includes(outlet.id),
  );
  const orders = useManagementStore((state) => state.orders);
  const users = useManagementStore((state) => state.users);
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("all");
  const [status, setStatus] = useState("all");
  const [outletId, setOutletId] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, error, isLoading, refresh } = useAsyncData(
    () =>
      managementService.listPayments({
        search,
        method,
        status,
        outletId,
        dateFrom,
        dateTo,
        page,
        pageSize: 10,
      }),
    JSON.stringify([search, method, status, outletId, dateFrom, dateTo, page]),
  );

  const orderFor = (orderId: string) =>
    orders.find((order) => order.id === orderId) ?? null;
  const outletName = (id: string) =>
    outlets.find((outlet) => outlet.id === id)?.name ?? "Tidak ada";
  const userName = (id: string) =>
    users.find((user) => user.id === id)?.name ?? "Tidak ada";

  return (
    <RequirePermission permission="payments.view">
      <div className="flex flex-col gap-6">
        <PageHeader
          description="Pembayaran bersifat baca saja di Fase 2. Data simulasi."
          title="Pembayaran"
        />

        <Card>
          <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
            <DataTableToolbar
              filters={
                <>
                  <Select
                    aria-label="Filter metode"
                    className="w-40"
                    onChange={(event) => {
                      setMethod(event.target.value);
                      setPage(1);
                    }}
                    value={method}
                  >
                    <option value="all">Semua metode</option>
                    <option value="CASH">Tunai</option>
                    <option value="QRIS">QRIS</option>
                    <option value="TRANSFER">Transfer</option>
                    <option value="E_WALLET">Dompet digital</option>
                  </Select>
                  <Select
                    aria-label="Filter status pembayaran"
                    className="w-40"
                    onChange={(event) => {
                      setStatus(event.target.value);
                      setPage(1);
                    }}
                    value={status}
                  >
                    <option value="all">Semua status</option>
                    <option value="RECORDED">Tercatat</option>
                    <option value="REFUNDED">Dikembalikan</option>
                  </Select>
                  <Select
                    aria-label="Filter outlet"
                    className="w-48"
                    onChange={(event) => {
                      setOutletId(event.target.value);
                      setPage(1);
                    }}
                    value={outletId}
                  >
                    <option value="all">Semua outlet</option>
                    {outlets.map((outlet) => (
                      <option key={outlet.id} value={outlet.id}>
                        {outlet.name}
                      </option>
                    ))}
                  </Select>
                  <DatePicker
                    aria-label="Tanggal mulai"
                    className="w-40"
                    onChange={(event) => {
                      setDateFrom(event.target.value);
                      setPage(1);
                    }}
                    value={dateFrom}
                  />
                  <DatePicker
                    aria-label="Tanggal akhir"
                    className="w-40"
                    onChange={(event) => {
                      setDateTo(event.target.value);
                      setPage(1);
                    }}
                    value={dateTo}
                  />
                </>
              }
              hasActiveFilters={
                search !== "" ||
                method !== "all" ||
                status !== "all" ||
                outletId !== "all" ||
                dateFrom !== "" ||
                dateTo !== ""
              }
              onReset={() => {
                setSearch("");
                setMethod("all");
                setStatus("all");
                setOutletId("all");
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              resultCount={data?.total ?? 0}
              search={search}
              searchPlaceholder="Cari nomor pesanan"
            />

            {isLoading ? (
              <TableSkeleton columns={6} />
            ) : error ? (
              <ErrorState onRetry={refresh} />
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                description="Belum ada pembayaran pada filter ini. Ubah filter untuk melihat data lain."
                icon={Wallet}
                title="Belum ada pembayaran"
              />
            ) : (
              <ResponsiveList
                cards={data.items.map((payment) => {
                  const order = orderFor(payment.orderId);
                  return (
                    <button
                      className="flex min-h-11 flex-col gap-2 rounded-md border border-border bg-surface p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                      key={payment.id}
                      onClick={() => setSelected(payment)}
                      type="button"
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="flex flex-col">
                          <span className="text-body font-medium text-foreground">
                            {order?.orderNumber ?? "Pesanan tidak ditemukan"}
                          </span>
                          <span className="text-caption text-muted-foreground">
                            {formatDateTime(payment.paidAt)}
                          </span>
                        </span>
                        <span className="text-body font-medium tabular-nums text-foreground">
                          {formatCurrency(payment.amount)}
                        </span>
                      </span>
                      <span className="flex flex-wrap items-center gap-1.5">
                        <Badge tone="neutral">
                          {methodLabels[payment.method]}
                        </Badge>
                        <Badge
                          tone={
                            payment.status === "REFUNDED" ? "info" : "success"
                          }
                        >
                          {payment.status === "REFUNDED"
                            ? "Dikembalikan"
                            : "Tercatat"}
                        </Badge>
                      </span>
                      <span className="text-caption text-muted-foreground">
                        {order ? outletName(order.outletId) : "Tidak ada"}
                      </span>
                    </button>
                  );
                })}
                table={
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pesanan</TableHead>
                        <TableHead>Metode</TableHead>
                        <TableHead className="text-right">Nominal</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Dicatat oleh</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.items.map((payment) => {
                        const order = orderFor(payment.orderId);
                        return (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                              {order?.orderNumber ?? "Tidak ada"}
                            </TableCell>
                            <TableCell>
                              {methodLabels[payment.method]}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                tone={
                                  payment.status === "REFUNDED"
                                    ? "info"
                                    : "success"
                                }
                              >
                                {payment.status === "REFUNDED"
                                  ? "Dikembalikan"
                                  : "Tercatat"}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {formatDateTime(payment.paidAt)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {userName(payment.recordedBy)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                onClick={() => setSelected(payment)}
                                size="sm"
                                variant="ghost"
                              >
                                Lihat pembayaran
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                }
              />
            )}
          </CardContent>
          {data && data.total > 0 ? (
            <TablePagination
              onPageChange={setPage}
              page={data.page}
              pageCount={data.pageCount}
              pageSize={data.pageSize}
              total={data.total}
            />
          ) : null}
        </Card>

        <Drawer
          description="Catatan pembayaran bersifat baca saja."
          onOpenChange={(open) => {
            if (!open) {
              setSelected(null);
            }
          }}
          open={selected !== null}
          title="Detail pembayaran"
        >
          {selected ? (
            <div className="flex flex-col gap-4">
              <dl className="grid gap-2 text-body">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Pesanan</dt>
                  <dd>
                    {orderFor(selected.orderId)?.orderNumber ?? "Tidak ada"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Outlet</dt>
                  <dd>
                    {orderFor(selected.orderId)
                      ? outletName(orderFor(selected.orderId)?.outletId ?? "")
                      : "Tidak ada"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Metode</dt>
                  <dd>{methodLabels[selected.method]}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Nominal</dt>
                  <dd className="font-medium tabular-nums">
                    {formatCurrency(selected.amount)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge
                      tone={selected.status === "REFUNDED" ? "info" : "success"}
                    >
                      {selected.status === "REFUNDED"
                        ? "Dikembalikan"
                        : "Tercatat"}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Referensi</dt>
                  <dd>{selected.reference || "Tidak ada"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Waktu</dt>
                  <dd>{formatDateTime(selected.paidAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Dicatat oleh</dt>
                  <dd>{userName(selected.recordedBy)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Catatan</dt>
                  <dd className="max-w-56 text-right">
                    {selected.notes || "Tidak ada"}
                  </dd>
                </div>
              </dl>
              <Button
                disabled={!orderFor(selected.orderId)}
                onClick={() => {
                  const order = orderFor(selected.orderId);
                  if (order) {
                    setSelectedOrder(order);
                  }
                }}
                variant="outline"
              >
                Lihat detail pesanan
              </Button>
              <p className="rounded-md border border-border bg-surface-subtle px-3 py-2 text-caption text-muted-foreground">
                Refund dan pencatatan pembayaran baru belum tersedia di Fase 2.
              </p>
            </div>
          ) : null}
        </Drawer>

        <OrderDetailDrawer
          onOpenChange={(open) => {
            if (!open) {
              setSelectedOrder(null);
            }
          }}
          onOrderChanged={refresh}
          order={selectedOrder}
        />
      </div>
    </RequirePermission>
  );
}
