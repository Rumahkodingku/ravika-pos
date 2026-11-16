import { Pagination } from "@/components/ui/pagination";

export function TablePagination({
  onPageChange,
  page,
  pageCount,
  pageSize,
  total,
}: {
  onPageChange: (page: number) => void;
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-border p-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-caption text-muted-foreground">
        Menampilkan {start} sampai {end} dari {total} data.
      </p>
      <Pagination
        onPageChange={onPageChange}
        page={page}
        pageCount={pageCount}
      />
    </div>
  );
}
