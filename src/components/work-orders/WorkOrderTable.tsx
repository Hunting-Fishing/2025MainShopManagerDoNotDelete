import React, { useState } from "react";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, FileText, Edit, Trash, Clock, Loader2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { WorkOrder } from "@/types/workOrder";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { formatTimeInHoursAndMinutes } from "@/utils/workOrders";

export interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  onDelete?: (id: string) => void;
  loading?: boolean;
}

export function WorkOrderTable({ workOrders, onDelete, loading = false }: WorkOrderTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRowExpanded = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <div className="border rounded-md p-8 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading work orders...</p>
      </div>
    );
  }

  if (!workOrders || workOrders.length === 0) {
    return (
      <div className="text-center py-10 border rounded-md bg-slate-50">
        <h3 className="text-lg font-medium">No work orders found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your filters or create a new work order
        </p>
        <Button asChild className="mt-4">
          <Link to="/work-orders/create">Create Work Order</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[200px]">Customer</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.map((workOrder) => (
            <React.Fragment key={workOrder.id}>
              <TableRow
                className={expandedRows[workOrder.id] ? "border-b-0" : ""}
                onClick={() => toggleRowExpanded(workOrder.id)}
              >
                <TableCell className="font-medium">
                  {workOrder.customer}
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {workOrder.description}
                </TableCell>
                <TableCell>
                  <StatusBadge status={workOrder.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={workOrder.priority} />
                </TableCell>
                <TableCell>{workOrder.technician}</TableCell>
                <TableCell>
                  {workOrder.dueDate ? format(new Date(workOrder.dueDate), "MMM dd, yyyy") : "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/work-orders/${workOrder.id}`} className="flex items-center cursor-pointer">
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/work-orders/${workOrder.id}/edit`} className="flex items-center cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/work-orders/${workOrder.id}/time-tracking`} className="flex items-center cursor-pointer">
                          <Clock className="h-4 w-4 mr-2" />
                          Time Tracking
                        </Link>
                      </DropdownMenuItem>
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(workOrder.id);
                          }}
                          className="text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              
              {expandedRows[workOrder.id] && (
                <TableRow>
                  <TableCell colSpan={7} className="bg-slate-50 p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Location</h4>
                        <p className="text-sm">{workOrder.location || "N/A"}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Service Type</h4>
                        <p className="text-sm">{workOrder.serviceType || "N/A"}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-1">Billable Hours</h4>
                        <p className="text-sm">
                          {workOrder.totalBillableTime 
                            ? formatTimeInHoursAndMinutes(workOrder.totalBillableTime) 
                            : "0h 0m"}
                        </p>
                      </div>
                      
                      <div className="col-span-3">
                        <h4 className="text-sm font-medium mb-1">Notes</h4>
                        <p className="text-sm text-gray-600">{workOrder.notes || "No notes"}</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
