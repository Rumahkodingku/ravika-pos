import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export function TableSkeleton({
  columns = 5,
  rows = 6,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <output aria-busy="true" aria-label="Memuat data" className="block w-full">
      <Table>
        <TableBody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows are static placeholders.
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }, (_, columnIndex) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton cells are static placeholders.
                <TableCell key={columnIndex}>
                  <Skeleton
                    className={columnIndex === 0 ? "h-4 w-40" : "h-4 w-24"}
                    shape="text"
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </output>
  );
}
