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

export function SearchQueriesTable({ data = [] }) {
  const [sorting, setSorting] = React.useState([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "user_name",
        header: "User",
        cell: ({ row }) => (
          <div className="font-medium text-foreground">
            {row.original.user_name}
          </div>
        ),
      },
      {
        accessorKey: "profession",
        header: "Profession",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.profession}
          </span>
        ),
      },
      {
        accessorKey: "search_word",
        header: "Search Query",
        cell: ({ row }) => (
          <div className="bg-muted px-3 py-1 rounded-full text-sm w-fit">
            {row.original.search_word}
          </div>
        ),
      },
      {
        accessorKey: "result_count",
        header: "Results",
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-semibold rounded-md bg-blue-100 text-blue-700">
            {row.original.result_count}
          </span>
        ),
      },
      {
        accessorKey: "created_timestamp",
        header: "Created At",
        cell: ({ row }) => {
          const date = new Date(row.original.created_timestamp);
          return (
            <span className="text-sm text-muted-foreground">
              {date.toLocaleDateString()}
            </span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Search Queries</h2>

        <Input
          placeholder="Search queries..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm rounded-xl"
        />
      </div>

      {/* Card Container */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[500px]">
          <Table>
            <TableHeader className="bg-gray-50 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer select-none font-semibold text-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                          {isSorted === "asc" && (
                            <ArrowUp size={14} />
                          )}
                          {isSorted === "desc" && (
                            <ArrowDown size={14} />
                          )}
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
                    } hover:bg-blue-50`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                  <TableCell colSpan={5} className="text-center h-24">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
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
