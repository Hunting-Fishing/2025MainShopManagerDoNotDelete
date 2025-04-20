
import React from "react";
import { WorkOrder } from "@/types/workOrder";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Eye } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const WorkOrderTable: React.FC<WorkOrderTableProps> = ({
  workOrders,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
}) => {
  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
            <p className="text-sm text-slate-500">Loading work orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (workOrders.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium">No work orders found</h3>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your search or filter criteria
            </p>
            <Button 
              asChild 
              variant="default" 
              className="mt-4 bg-indigo-600 hover:bg-indigo-700"
            >
              <Link to="/work-orders/new">Create Work Order</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workOrders.map((workOrder) => (
              <TableRow key={workOrder.id} className="hover:bg-slate-50">
                <TableCell className="font-medium">{workOrder.id.substring(0, 8)}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {workOrder.description}
                </TableCell>
                <TableCell>{workOrder.customer}</TableCell>
                <TableCell>{workOrder.technician}</TableCell>
                <TableCell>
                  {workOrder.date ? format(new Date(workOrder.date), "MMM dd, yyyy") : "N/A"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={workOrder.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={workOrder.priority} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <Link to={`/work-orders/${workOrder.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      className="h-8 w-8"
                    >
                      <Link to={`/work-orders/${workOrder.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, total)} of {total} entries
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
