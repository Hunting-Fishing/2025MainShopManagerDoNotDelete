
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return "N/A";
      return format(new Date(dateStr), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleRowClick = (workOrder: WorkOrder) => {
    navigate(`/work-orders/${workOrder.id}`);
  };

  if (loading) {
    return (
      <div className="rounded-md border bg-white p-8 flex justify-center items-center">
        <p className="text-muted-foreground">Loading work orders...</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead className="max-w-[250px]">Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length > 0 ? (
            workOrders.map((workOrder) => (
              <TableRow 
                key={workOrder.id}
                onClick={() => handleRowClick(workOrder)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell className="font-medium">{workOrder.id.substring(0, 8)}</TableCell>
                <TableCell>{workOrder.customer || 'N/A'}</TableCell>
                <TableCell>
                  {(workOrder.vehicleMake && workOrder.vehicleModel) 
                    ? `${workOrder.vehicleMake} ${workOrder.vehicleModel}` 
                    : 'N/A'}
                </TableCell>
                <TableCell className="max-w-[250px]">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="truncate">{workOrder.description || 'No description'}</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[300px] break-words">{workOrder.description}</p>
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
                  <Badge className={getPriorityClass(workOrder.priority)}>
                    {workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{workOrder.technician || 'Unassigned'}</TableCell>
                <TableCell>{workOrder.serviceType || workOrder.service_type || 'N/A'}</TableCell>
                <TableCell>{formatDate(workOrder.date || workOrder.createdAt)}</TableCell>
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
    </div>
  );
};

export default WorkOrderTable;
