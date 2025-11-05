import * as React from "react";
import { cn } from "../../lib/utils";

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  TableBodyProps
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = "TableRow";

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
);
TableCell.displayName = "TableCell";

export interface DataTableProps<T> {
  data: T[];
  columns: Array<{
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    sortable?: boolean;
  }>;
  className?: string;
}

export function DataTable<T>({ data, columns, className }: DataTableProps<T>) {
  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          {columns.map((column, idx) => (
            <TableHead key={idx}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIdx) => (
          <TableRow key={rowIdx}>
            {columns.map((column, colIdx) => (
              <TableCell key={colIdx}>
                {typeof column.accessor === "function"
                  ? column.accessor(row)
                  : String(row[column.accessor])}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
