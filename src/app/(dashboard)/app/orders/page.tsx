"use client";

import type {
  ColumnDef,
  OnChangeFn,
  SortingState,
} from "@tanstack/react-table";
import { ClipboardList, Eye } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { ResponsiveList } from "@/components/data-table/responsive-list";
import { TableActions } from "@/components/data-table/table-actions";
import { TablePagination } from "@/components/data-table/table-pagination";
import { TableSkeleton } from "@/components/data-table/table-skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/layout";
import { Select } from "@/components/ui/select";
import { useOrdersQuery } from "@/features/management/api/orders";
import { OrderDetailDrawer } from "@/features/management/order-detail-drawer";
import { RequirePermission } from "@/features/management/permission-gate";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Order } from "@/types/domain";

type OrderFilters = {
  orderStatus: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
};

const defaultOrderFilters: OrderFilters = {
  orderStatus: "all",
  paymentStatus: "all",
  dateFrom: "",
  dateTo: "",
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<OrderFilters>(defaultOrderFilters);
  const [draftFilters, setDraftFilters] =
    useState<OrderFilters>(defaultOrderFilters);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Order | null>(null);

  const { data, error, isLoading, refetch } = useOrdersQuery({
    search,
    orderStatus: filters.orderStatus,
    paymentStatus: filters.paymentStatus,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    sortBy: "createdAt",
    sortDir,
    page,
    pageSize: 10,
  });

  const activeFilterCount = [
    filters.orderStatus !== defaultOrderFilters.orderStatus,
    filters.paymentStatus !== defaultOrderFilters.paymentStatus,
    filters.dateFrom !== defaultOrderFilters.dateFrom,
    filters.dateTo !== defaultOrderFilters.dateTo,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearch("");
    setFilters(defaultOrderFilters);
    setDraftFilters(defaultOrderFilters);
    setPage(1);
  };

  const sorting: SortingState = [{ desc: sortDir === "desc", id: "createdAt" }];
  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === "function" ? updater(sorting) : updater;
    const first = next[0];

    if (first?.id === "createdAt") {
      setSortDir(first.desc ? "desc" : "asc");
    }
  };

  const columns: ColumnDef<Order>[] = [
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
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Waktu" />
      ),
    },
    {
      accessorKey: "orderType",
      cell: ({ row }) => (
        <Badge tone="neutral">
          {row.original.orderType === "DINE_IN" ? "Dine-in" : "Takeaway"}
        </Badge>
      ),
      header: "Tipe",
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
    {
      cell: ({ row }) => (
        <TableActions
          actions={[
            {
              icon: Eye,
              label: `Lihat detail ${row.original.orderNumber}`,
              onClick: () => setSelected(row.original),
            },
          ]}
        />
      ),
      header: "Aksi",
      id: "actions",
      meta: { cellClassName: "text-right", className: "text-right" },
    },
  ];

  return (
    <RequirePermission permission="orders.view">
      <div className="flex flex-col gap-6">
        <PageHeader
          description="Pantau pesanan, status pembayaran, dan persiapan."
          title="Pesanan"
        />

        <Card>
          <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
            <DataTableToolbar
              activeFilterCount={activeFilterCount}
              filterMode="modal"
              filters={
                <div className="flex flex-col gap-4">
                  <Field
                    htmlFor="orders-filter-preparation"
                    label="Status persiapan"
                  >
                    <Select
                      id="orders-filter-preparation"
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          orderStatus: event.target.value,
                        }))
                      }
                      value={draftFilters.orderStatus}
                    >
                      <option value="all">Semua persiapan</option>
                      <option value="NEW">Baru</option>
                      <option value="ACCEPTED">Diterima</option>
                      <option value="PREPARING">Disiapkan</option>
                      <option value="READY">Siap</option>
                      <option value="COMPLETED">Selesai</option>
                      <option value="CANCELLED">Dibatalkan</option>
                    </Select>
                  </Field>
                  <Field
                    htmlFor="orders-filter-payment"
                    label="Status pembayaran"
                  >
                    <Select
                      id="orders-filter-payment"
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          paymentStatus: event.target.value,
                        }))
                      }
                      value={draftFilters.paymentStatus}
                    >
                      <option value="all">Semua pembayaran</option>
                      <option value="UNPAID">Belum dibayar</option>
                      <option value="PARTIALLY_PAID">Dibayar sebagian</option>
                      <option value="PAID">Lunas</option>
                      <option value="REFUNDED">Dikembalikan</option>
                    </Select>
                  </Field>
                  <Field htmlFor="orders-filter-from" label="Tanggal mulai">
                    <DatePicker
                      id="orders-filter-from"
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          dateFrom: event.target.value,
                        }))
                      }
                      value={draftFilters.dateFrom}
                    />
                  </Field>
                  <Field htmlFor="orders-filter-to" label="Tanggal akhir">
                    <DatePicker
                      id="orders-filter-to"
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          dateTo: event.target.value,
                        }))
                      }
                      value={draftFilters.dateTo}
                    />
                  </Field>
                </div>
              }
              hasActiveFilters={activeFilterCount > 0}
              onFilterApply={() => {
                setFilters(draftFilters);
                setPage(1);
              }}
              onFilterOpen={() => setDraftFilters(filters)}
              onReset={resetFilters}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              resultCount={data?.total ?? 0}
              search={search}
              searchPlaceholder="Cari nomor pesanan"
              showResultCount={false}
            />

            {isLoading ? (
              <TableSkeleton columns={7} />
            ) : error ? (
              <ErrorState onRetry={() => refetch()} />
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
                  <DataTable
                    columns={columns}
                    data={data.items}
                    getRowId={(order) => order.id}
                    onSortingChange={onSortingChange}
                    sorting={sorting}
                  />
                }
                tableBreakpoint="xl"
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
          onOrderChanged={() => refetch()}
          order={selected}
        />
      </div>
    </RequirePermission>
  );
}
