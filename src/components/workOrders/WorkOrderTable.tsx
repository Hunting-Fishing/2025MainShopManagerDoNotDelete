
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { WorkOrder } from "@/types/workOrder";
import { priorityMap } from "@/utils/workOrders/index";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  selectedWorkOrders?: WorkOrder[];
  onSelectWorkOrder?: (workOrder: WorkOrder, isSelected: boolean) => void;
}

export const WorkOrderTable: React.FC<WorkOrderTableProps> = ({
  workOrders,
  loading,
  page,
  pageSize,
  total,
  onPageChange,
  selectedWorkOrders = [],
  onSelectWorkOrder = () => {}
}) => {
  const navigate = useNavigate();
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const handleRowClick = (workOrder: WorkOrder, e: React.MouseEvent) => {
    // Don't navigate if clicking on the checkbox
    if ((e.target as HTMLElement).closest('.checkbox-cell')) return;
    
    navigate(`/work-orders/${workOrder.id}`);
  };

  const isSelected = (workOrder: WorkOrder) => {
    return selectedWorkOrders.some(selected => selected.id === workOrder.id);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Not set";
    try {
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 checkbox-cell">
              <span className="sr-only">Select</span>
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-primary rounded-full"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : workOrders.length > 0 ? (
            workOrders.map((workOrder) => (
              <TableRow 
                key={workOrder.id}
                onClick={(e) => handleRowClick(workOrder, e)}
                className={cn(
                  "cursor-pointer hover:bg-gray-50",
                  isSelected(workOrder) ? "bg-indigo-50" : ""
                )}
              >
                <TableCell className="checkbox-cell">
                  <Checkbox
                    checked={isSelected(workOrder)}
                    onCheckedChange={(checked) => {
                      onSelectWorkOrder(workOrder, checked === true);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{workOrder.id.substring(0, 8)}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{workOrder.id}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{workOrder.customer}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate block">{workOrder.description}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{workOrder.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusClass(workOrder.status)}>
                    {workOrder.status.charAt(0).toUpperCase() +
                      workOrder.status.slice(1).replace("-", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={priorityMap[workOrder.priority as keyof typeof priorityMap]?.classes || "bg-gray-100 text-gray-800 border border-gray-300"}>
                    {priorityMap[workOrder.priority as keyof typeof priorityMap]?.label || workOrder.priority}
                  </Badge>
                </TableCell>
                <TableCell>{workOrder.technician}</TableCell>
                <TableCell>
                  {workOrder.vehicleMake && workOrder.vehicleModel 
                    ? `${workOrder.vehicleMake} ${workOrder.vehicleModel}`
                    : 'Not specified'}
                </TableCell>
                <TableCell>{formatDate(workOrder.createdAt || workOrder.date)}</TableCell>
                <TableCell>{formatDate(workOrder.dueDate)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                No work orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Simple Pagination */}
      {workOrders.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min((page - 1) * pageSize + 1, total)} to {Math.min(page * pageSize, total)} of {total} entries
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-2 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <div className="px-2 py-1 text-sm">{page}</div>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page * pageSize >= total}
              className="px-2 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};
