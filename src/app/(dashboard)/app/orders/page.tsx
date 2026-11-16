"use client";

import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
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
import { SortableTableHead } from "@/features/management/sortable-table-head";
import { TablePagination } from "@/features/management/table-pagination";
import { TableSkeleton } from "@/features/management/table-skeleton";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useAsyncData, useManagementStore } from "@/mocks/management/hooks";
import { managementService } from "@/mocks/management/service";
import type { Order } from "@/types/domain";

export default function OrdersPage() {
  const { user } = useMockSession();
  const allOutlets = useManagementStore((state) => state.outlets);
  const outlets = allOutlets.filter((outlet) =>
    user?.outletIds.includes(outlet.id),
  );
  const [search, setSearch] = useState("");
  const [outletId, setOutletId] = useState("all");
  const [orderStatus, setOrderStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);

  const { data, error, isLoading, refresh } = useAsyncData(
    () =>
      managementService.listOrders({
        search,
        outletId,
        orderStatus,
        paymentStatus,
        dateFrom,
        dateTo,
        sortBy: "createdAt",
        sortDir,
        page,
        pageSize: 10,
      }),
    JSON.stringify([
      search,
      outletId,
      orderStatus,
      paymentStatus,
      dateFrom,
      dateTo,
      sortDir,
      page,
    ]),
  );

  const outletName = (id: string) =>
    outlets.find((outlet) => outlet.id === id)?.name ?? "Tidak ada";

  const resetFilters = () => {
    setSearch("");
    setOutletId("all");
    setOrderStatus("all");
    setPaymentStatus("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <RequirePermission permission="orders.view">
      <div className="flex flex-col gap-6">
        <PageHeader
          description="Pantau pesanan, status pembayaran, dan persiapan. Data simulasi."
          title="Pesanan"
        />

        <Card>
          <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
            <DataTableToolbar
              filters={
                <>
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
                  <Select
                    aria-label="Filter status pesanan"
                    className="w-40"
                    onChange={(event) => {
                      setOrderStatus(event.target.value);
                      setPage(1);
                    }}
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
                  <Select
                    aria-label="Filter status pembayaran"
                    className="w-44"
                    onChange={(event) => {
                      setPaymentStatus(event.target.value);
                      setPage(1);
                    }}
                    value={paymentStatus}
                  >
                    <option value="all">Semua pembayaran</option>
                    <option value="UNPAID">Belum dibayar</option>
                    <option value="PARTIALLY_PAID">Dibayar sebagian</option>
                    <option value="PAID">Lunas</option>
                    <option value="REFUNDED">Dikembalikan</option>
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
                outletId !== "all" ||
                orderStatus !== "all" ||
                paymentStatus !== "all" ||
                dateFrom !== "" ||
                dateTo !== ""
              }
              onReset={resetFilters}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              resultCount={data?.total ?? 0}
              search={search}
              searchPlaceholder="Cari nomor pesanan"
            />

            {isLoading ? (
              <TableSkeleton columns={7} />
            ) : error ? (
              <ErrorState onRetry={refresh} />
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                description="Belum ada pesanan pada filter ini. Ubah filter atau kembali lagi nanti."
                icon={ClipboardList}
                title="Belum ada pesanan"
              />
            ) : (
              <ResponsiveList
                cards={data.items.map((order) => (
                  <div
                    className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3"
                    key={order.id}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-body font-medium text-foreground">
                          {order.orderNumber}
                        </span>
                        <span className="text-caption text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </div>
                      <span className="text-body font-medium tabular-nums text-foreground">
                        {formatCurrency(order.grandTotal)}
                      </span>
                    </div>
                    <span className="text-caption text-muted-foreground">
                      {outletName(order.outletId)}.{" "}
                      {order.orderType === "DINE_IN" ? "Dine-in" : "Takeaway"}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge
                        kind="preparation"
                        status={order.orderStatus}
                      />
                      <StatusBadge
                        kind="payment"
                        status={order.paymentStatus}
                      />
                    </div>
                    <Button
                      onClick={() => setSelected(order)}
                      size="sm"
                      variant="outline"
                    >
                      Lihat detail
                    </Button>
                  </div>
                ))}
                table={
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nomor</TableHead>
                        <SortableTableHead
                          active
                          direction={sortDir}
                          label="Waktu"
                          onSort={() =>
                            setSortDir((current) =>
                              current === "asc" ? "desc" : "asc",
                            )
                          }
                          sortKey="createdAt"
                        />
                        <TableHead>Outlet</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Pembayaran</TableHead>
                        <TableHead>Persiapan</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.items.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.orderNumber}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {formatDateTime(order.createdAt)}
                          </TableCell>
                          <TableCell>{outletName(order.outletId)}</TableCell>
                          <TableCell>
                            <Badge tone="neutral">
                              {order.orderType === "DINE_IN"
                                ? "Dine-in"
                                : "Takeaway"}
                            </Badge>
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
                          <TableCell className="text-right">
                            <Button
                              onClick={() => setSelected(order)}
                              size="sm"
                              variant="ghost"
                            >
                              Lihat detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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

        <OrderDetailDrawer
          onOpenChange={(open) => {
            if (!open) {
              setSelected(null);
            }
          }}
          onOrderChanged={refresh}
          order={selected}
        />
      </div>
    </RequirePermission>
  );
}
