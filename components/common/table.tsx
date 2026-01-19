import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

interface TableComponentProps {
  table: any;
  columns: any[];
}

function TableComponent({ table, columns }: TableComponentProps) {
  return (
    <div className="w-full max-w-7xl rounded-md border overflow-x-auto">
      <ScrollArea className="w-full">
        <Table className="miw-max">
          <TableHeader>
            {table
              .getHeaderGroups()
              .map((headerGroup: { id: string; headers: any[] }) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(
                    (header: {
                      id: string;
                      isPlaceholder: boolean;
                      column: any;
                    }) => {
                      return (
                        <TableHead
                          className="font-semibold text-muted-foreground"
                          key={header.id}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                (
                                  header as {
                                    id: string;
                                    isPlaceholder: boolean;
                                    column: any;
                                    getContext: () => any;
                                  }
                                ).getContext(),
                              )}
                        </TableHead>
                      );
                    },
                  )}
                </TableRow>
              ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table
                .getRowModel()
                .rows.map(
                  (row: {
                    id: string;
                    getIsSelected: () => boolean;
                    getVisibleCells: () => any[];
                  }) => {
                    return (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={`text-black-solid`}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  },
                )
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No result found. Try adjusting your search or filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" className="cursor-pointer" />
      </ScrollArea>
    </div>
  );
}

export default TableComponent;
