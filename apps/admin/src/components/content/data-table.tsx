'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  filterColumn?: string;
  filterOptions?: { label: string; value: string }[];
  isLoading?: boolean;
}

type ColumnMeta = {
  mobile?: 'hidden' | 'primary' | 'actions';
  label?: string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey = 'title',
  searchPlaceholder = 'Rechercher...',
  filterColumn,
  filterOptions,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const getColumnLabel = (
    columnId: string,
    column: { columnDef: ColumnDef<TData, TValue> },
  ) => {
    const meta = column.columnDef.meta as ColumnMeta | undefined;
    if (meta?.label) return meta.label;
    if (typeof column.columnDef.header === 'string') return column.columnDef.header;
    return columnId;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="pl-9"
            />
          </div>
          {filterColumn && filterOptions && (
            <Select
              value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''}
              onValueChange={(value) =>
                table.getColumn(filterColumn)?.setFilterValue(value === 'all' ? '' : value)
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Colonnes <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const rowCells = row.getVisibleCells().filter((cell) => {
                  const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                  return meta?.mobile !== 'hidden';
                });

                const primaryCell =
                  rowCells.find((cell) => {
                    const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                    return meta?.mobile === 'primary';
                  }) || rowCells[0];

                const detailCells = rowCells.filter((cell) => {
                  if (cell.id === primaryCell?.id) return false;
                  const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                  if (meta?.mobile === 'actions') return false;
                  return true;
                });

                const actionCells = rowCells.filter((cell) => {
                  const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                  return meta?.mobile === 'actions' || cell.column.id === 'actions';
                });

                return (
                  <div key={row.id} className="rounded-lg border p-4 space-y-3">
                    {primaryCell && (
                      <div className="text-sm font-medium">
                        {flexRender(primaryCell.column.columnDef.cell, primaryCell.getContext())}
                      </div>
                    )}
                    {detailCells.map((cell) => (
                      <div key={cell.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                          {getColumnLabel(cell.column.id, cell.column)}
                        </span>
                        <span className="text-right">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </span>
                      </div>
                    ))}
                    {actionCells.length > 0 && (
                      <div className="flex justify-end gap-2">
                        {actionCells.map((cell) => (
                          <div key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                Aucun résultat.
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        Aucun résultat.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2">
            <div className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} élément(s)
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Suivant
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
