"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Wallet } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { ResponsiveList } from "@/components/data-table/responsive-list";
import { TableActions } from "@/components/data-table/table-actions";
import { TablePagination } from "@/components/data-table/table-pagination";
import { TableSkeleton } from "@/components/data-table/table-skeleton";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Drawer } from "@/components/ui/drawer";
import { Field } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/layout";
import { Select } from "@/components/ui/select";
import { useOrderQuery } from "@/features/management/api/orders";
import { usePaymentsQuery } from "@/features/management/api/payments";
import { OrderDetailDrawer } from "@/features/management/order-detail-drawer";
import { RequirePermission } from "@/features/management/permission-gate";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Payment, PaymentMethod } from "@/types/domain";

const methodLabels: Record<PaymentMethod, string> = {
  CASH: "Tunai",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  E_WALLET: "Dompet digital",
};

type PaymentFilters = {
  method: string;
  status: string;
  dateFrom: string;
  dateTo: string;
};

const defaultPaymentFilters: PaymentFilters = {
  method: "all",
  status: "all",
  dateFrom: "",
  dateTo: "",
};

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<PaymentFilters>(defaultPaymentFilters);
  const [draftFilters, setDraftFilters] = useState<PaymentFilters>(
    defaultPaymentFilters,
  );
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Payment | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const orderQuery = useOrderQuery(selectedOrderId);

  const { data, error, isLoading, refetch } = usePaymentsQuery({
    search,
    method: filters.method,
    status: filters.status,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    page,
    pageSize: 10,
  });

  const activeFilterCount = [
    filters.method !== defaultPaymentFilters.method,
    filters.status !== defaultPaymentFilters.status,
    filters.dateFrom !== defaultPaymentFilters.dateFrom,
    filters.dateTo !== defaultPaymentFilters.dateTo,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearch("");
    setFilters(defaultPaymentFilters);
    setDraftFilters(defaultPaymentFilters);
    setPage(1);
  };

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "orderNumber",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.orderNumber ?? "Tidak ada"}
        </span>
      ),
      header: "Pesanan",
    },
    {
      accessorKey: "method",
      cell: ({ row }) => methodLabels[row.original.method],
      header: "Metode",
    },
    {
      accessorKey: "amount",
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatCurrency(row.original.amount)}
        </span>
      ),
      header: "Nominal",
      meta: { cellClassName: "text-right", className: "text-right" },
    },
    {
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge tone={row.original.status === "REFUNDED" ? "info" : "success"}>
          {row.original.status === "REFUNDED" ? "Dikembalikan" : "Tercatat"}
        </Badge>
      ),
      header: "Status",
    },
    {
      accessorKey: "paidAt",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDateTime(row.original.paidAt)}
        </span>
      ),
      header: "Waktu",
    },
    {
      accessorKey: "recordedByName",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.recordedByName ?? "Tidak ada"}
        </span>
      ),
      header: "Dicatat oleh",
    },
    {
      cell: ({ row }) => (
        <TableActions
          actions={[
            {
              icon: Eye,
              label: `Lihat pembayaran ${row.original.orderNumber ?? ""}`,
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
    <RequirePermission permission="payments.view">
      <div className="flex flex-col gap-6">
        <PageHeader
          description="Pembayaran bersifat baca saja."
          title="Pembayaran"
        />

        <Card>
          <CardContent className="flex flex-col gap-3 p-3 sm:p-4">
            <DataTableToolbar
              activeFilterCount={activeFilterCount}
              filterDescription="Pilih metode, status, dan rentang tanggal."
              filterMode="modal"
              filterTitle="Filter pembayaran"
              filters={
                <div className="flex flex-col gap-4">
                  <Field htmlFor="payments-filter-method" label="Metode">
                    <Select
                      id="payments-filter-method"
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          method: event.target.value,
                        }))
                      }
                      value={draftFilters.method}
                    >
                      <option value="all">Semua metode</option>
                      <option value="CASH">Tunai</option>
                      <option value="QRIS">QRIS</option>
                      <option value="TRANSFER">Transfer</option>
                      <option value="E_WALLET">Dompet digital</option>
                    </Select>
                  </Field>
                  <Field htmlFor="payments-filter-status" label="Status">
                    <Select
                      id="payments-filter-status"
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          status: event.target.value,
                        }))
                      }
                      value={draftFilters.status}
                    >
                      <option value="all">Semua status</option>
                      <option value="RECORDED">Tercatat</option>
                      <option value="REFUNDED">Dikembalikan</option>
                    </Select>
                  </Field>
                  <Field htmlFor="payments-filter-from" label="Tanggal mulai">
                    <DatePicker
                      id="payments-filter-from"
                      onChange={(event) =>
                        setDraftFilters((current) => ({
                          ...current,
                          dateFrom: event.target.value,
                        }))
                      }
                      value={draftFilters.dateFrom}
                    />
                  </Field>
                  <Field htmlFor="payments-filter-to" label="Tanggal akhir">
                    <DatePicker
                      id="payments-filter-to"
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
              <TableSkeleton columns={6} />
            ) : error ? (
              <ErrorState onRetry={() => refetch()} />
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                description="Belum ada pembayaran pada filter ini. Ubah filter untuk melihat data lain."
                icon={Wallet}
                title="Belum ada pembayaran"
              />
            ) : (
              <ResponsiveList
                cards={data.items.map((payment) => (
                  <button
                    className="flex min-h-11 flex-col gap-2 rounded-md border border-border bg-surface p-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
                    key={payment.id}
                    onClick={() => setSelected(payment)}
                    type="button"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="flex flex-col">
                        <span className="text-body font-medium text-foreground">
                          {payment.orderNumber ?? "Tidak ada"}
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
                      Dicatat oleh {payment.recordedByName ?? "Tidak ada"}
                    </span>
                  </button>
                ))}
                table={
                  <DataTable
                    columns={columns}
                    data={data.items}
                    getRowId={(payment) => payment.id}
                  />
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
                  <dd>{selected.orderNumber ?? "Tidak ada"}</dd>
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
                  <dd>{selected.recordedByName ?? "Tidak ada"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Catatan</dt>
                  <dd className="max-w-56 text-right">
                    {selected.notes || "Tidak ada"}
                  </dd>
                </div>
              </dl>
              <Button
                onClick={() => setSelectedOrderId(selected.orderId)}
                variant="outline"
              >
                Lihat detail pesanan
              </Button>
              <p className="rounded-md border border-border bg-surface-subtle px-3 py-2 text-caption text-muted-foreground">
                Refund dan pencatatan pembayaran baru belum tersedia.
              </p>
            </div>
          ) : null}
        </Drawer>

        <OrderDetailDrawer
          onOpenChange={(open) => {
            if (!open) {
              setSelectedOrderId(null);
            }
          }}
          order={orderQuery.data ?? null}
        />
      </div>
    </RequirePermission>
  );
}
