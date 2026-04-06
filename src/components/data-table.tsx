import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column {
  key: string;
  label: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
}

export function DataTable<T>({ columns, data, renderRow }: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={`text-muted-foreground text-xs font-medium uppercase tracking-wider ${col.className ?? ""}`}
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, i) => renderRow(item, i))}
      </TableBody>
    </Table>
  );
}
