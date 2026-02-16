"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CityTable({ data = [] }) {
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

 
  const formattedData = React.useMemo(() => {
    return data.map((item) => ({
      city_code: item.viewed_profile_city_code,
      count: item.count,
    }));
  }, [data]);

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "city_code",
        header: "City",
        cell: ({ row }) => (
          <div className="font-medium text-foreground">
            {row.original.city_code}
          </div>
        ),
      },
      {
        accessorKey: "count",
        header: "Views",
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-semibold rounded-md bg-indigo-100 text-indigo-700">
            {row.original.count}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: formattedData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

return (
  <div className="w-full space-y-6">
    {/* Header + Search */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h2 className="text-lg font-semibold">City Analytics</h2>

      <Input
        placeholder="Search city..."
        value={globalFilter ?? ""}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="w-full sm:max-w-sm rounded-xl"
      />
    </div>

    {/* Card */}
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <Table className="min-w-[500px]">
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="cursor-pointer select-none font-semibold text-gray-700 whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}

                        {isSorted === "asc" && <ArrowUp size={14} />}
                        {isSorted === "desc" && <ArrowDown size={14} />}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={`transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-indigo-50`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="whitespace-nowrap text-sm"
                    >
                      {flexRender(
                        cell.column.columnDef.cell ??
                          cell.column.columnDef.accessorKey,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center h-24">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>

    {/* Pagination */}
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground text-center sm:text-left">
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl w-full sm:w-auto"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="rounded-xl w-full sm:w-auto"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  </div>
);

}
