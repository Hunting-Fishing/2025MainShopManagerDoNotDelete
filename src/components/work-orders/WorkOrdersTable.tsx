
import { useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Eye, Clock, Calendar, User } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  WorkOrder, 
  priorityMap, 
  statusMap 
} from "@/types/workOrder";
import { 
  getWorkOrderCustomer,
  getWorkOrderTechnician,
  getWorkOrderDate,
  getWorkOrderDueDate,
  getWorkOrderPriority,
  getWorkOrderLocation,
  getWorkOrderTotalBillableTime
} from "@/utils/workOrderUtils";

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
}

export default function WorkOrdersTable({ workOrders }: WorkOrdersTableProps) {
  
  // Function to get status badge styles
  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'pending':
        return 'text-yellow-800 bg-yellow-100 border-yellow-200';
      case 'in-progress':
        return 'text-blue-800 bg-blue-100 border-blue-200'; 
      case 'completed':
        return 'text-green-800 bg-green-100 border-green-200';
      case 'cancelled':
        return 'text-red-800 bg-red-100 border-red-200';
      default:
        return 'text-gray-800 bg-gray-100 border-gray-200';
    }
  };

  // If no work orders, show empty state
  if (workOrders.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-white dark:bg-slate-900">
        <h3 className="text-lg font-medium">No work orders found</h3>
        <p className="text-muted-foreground mt-1">
          Try adjusting your filters or create a new work order
        </p>
        <Button className="mt-4">
          <Link to="/work-orders/create">Create Work Order</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-white dark:bg-slate-900">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((order, index) => (
            <TableRow 
              key={order.id}
              colorIndex={index}
            >
              <TableCell className="font-mono text-sm">
                <Link 
                  to={`/work-orders/${order.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {order.id}
                </Link>
              </TableCell>
              <TableCell>
                {order.description}
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {getWorkOrderLocation(order) && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> 
                      {format(new Date(getWorkOrderDate(order) || order.created_at || new Date()), "MMM d, yyyy")}
                    </span>
                  )}
                  {getWorkOrderTechnician(order) && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" /> 
                      {getWorkOrderTechnician(order)}
                    </span>
                  )}
                  {getWorkOrderTotalBillableTime(order) > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 
                      {Math.floor(getWorkOrderTotalBillableTime(order) / 60)}h {getWorkOrderTotalBillableTime(order) % 60}m
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{getWorkOrderCustomer(order)}</TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={`rounded-full border px-2 py-1 font-medium ${getStatusStyles(order.status)}`}
                >
                  {statusMap[order.status] || order.status}
                </Badge>
              </TableCell>
              <TableCell>
                {getWorkOrderDueDate(order) ? 
                  format(new Date(getWorkOrderDueDate(order)), "MMM d, yyyy") : 
                  "—"}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={`rounded-full border text-xs ${priorityMap[getWorkOrderPriority(order)]?.classes || ""}`}
                >
                  {getWorkOrderPriority(order)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="rounded-full hover:bg-blue-50 hover:text-blue-600"
                  asChild
                >
                  <Link to={`/work-orders/${order.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
