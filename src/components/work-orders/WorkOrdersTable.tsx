import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkOrder } from "@/types/workOrder";
import { Link } from "react-router-dom";
import { formatDate, formatTimeInHoursAndMinutes } from "@/utils/workOrders/formatters";
import { Badge } from "@/components/ui/badge";
import { statusMap, priorityMap } from "@/utils/workOrders"; // Updated import path

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
}

const WorkOrdersTable: React.FC<WorkOrdersTableProps> = ({ workOrders }) => {
  const columns: ColumnDef<WorkOrder>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <Link to={`/work-orders/${row.getValue("id")}`} className="underline">
          {row.getValue("id")}
        </Link>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("date")),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => formatDate(row.getValue("dueDate")),
    },
    {
      accessorKey: "technician",
      header: "Technician",
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof statusMap;
        return (
          <Badge variant="secondary">
            {String(statusMap[status])}
          </Badge>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as keyof typeof priorityMap;
        return (
          <Badge className={priorityMap[priority]?.classes}>
            {priorityMap[priority]?.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "totalBillableTime",
      header: "Billable Time",
      cell: ({ row }) => {
        const totalBillableTime = row.getValue("totalBillableTime") as number;
        return formatTimeInHoursAndMinutes(totalBillableTime);
      },
    },
  ];

  const table = useReactTable({
    data: workOrders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkOrdersTable;
