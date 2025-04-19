
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkOrder } from "@/types/workOrder";
import { formatDate } from "@/utils/workOrders/formatters";
import { statusConfig, priorityConfig } from "@/utils/workOrders/statusManagement";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onViewWorkOrder?: (id: string) => void;
}

export function WorkOrderTable({ workOrders, onViewWorkOrder }: WorkOrderTableProps) {
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No work orders found
              </TableCell>
            </TableRow>
          ) : (
            workOrders.map((workOrder) => (
              <TableRow 
                key={workOrder.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onViewWorkOrder && onViewWorkOrder(workOrder.id)}
              >
                <TableCell className="font-mono text-xs">{workOrder.id.substring(0, 8)}</TableCell>
                <TableCell>{workOrder.customer}</TableCell>
                <TableCell className="max-w-[200px] truncate">{workOrder.description}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusConfig[workOrder.status]?.color}`}>
                    {statusConfig[workOrder.status]?.label || workOrder.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityConfig[workOrder.priority]?.color}`}>
                    {priorityConfig[workOrder.priority]?.label || workOrder.priority}
                  </span>
                </TableCell>
                <TableCell>{workOrder.technician}</TableCell>
                <TableCell>{formatDate(workOrder.dueDate)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
