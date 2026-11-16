import { EmptyState } from "@/components/feedback/empty-state";
import { TableCell, TableRow } from "@/components/ui/table";

export function TableEmpty({
  action,
  colSpan,
  description,
  title,
}: {
  action?: React.ReactNode;
  colSpan: number;
  description?: React.ReactNode;
  title: React.ReactNode;
}) {
  return (
    <TableRow>
      <TableCell className="p-3" colSpan={colSpan}>
        <EmptyState
          action={action}
          className="border-0 bg-transparent"
          description={description}
          title={title}
        />
      </TableCell>
    </TableRow>
  );
}
