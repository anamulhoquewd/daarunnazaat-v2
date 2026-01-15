import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { flexRender } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
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
                                ).getContext()
                              )}
                        </TableHead>
                      );
                    }
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
                        {row.getVisibleCells().map((cell) => {
                          const cellValue =
                            cell.column.id === "amount" &&
                            cell.getValue() !== undefined ? (
                              Number.parseFloat(cell.getValue()).toFixed(2)
                            ) : cell.column.id === "isActive" &&
                              cell.getValue() !== undefined ? (
                              cell.getValue() ? (
                                <Badge
                                  variant="outline"
                                  className={"border-green-500 text-green-500"}
                                >
                                  Active
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className={"border-red-500 text-red-500"}
                                >
                                  Inactive
                                </Badge>
                              )
                            ) : (cell.column.id === "createdAt" ||
                                cell.column.id === "updatedAt") &&
                              cell.getValue() !== undefined ? (
                              format(new Date(cell.getValue()), "yyyy-MM-dd")
                            ) : (
                              flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )
                            );

                          return (
                            <TableCell
                              key={cell.id}
                              className={`text-black-solid`}
                            >
                              {cellValue}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  }
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
