
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

interface WorkOrdersTableProps {
  workOrders: WorkOrder[];
  selectedWorkOrders: WorkOrder[];
  onSelectWorkOrder: (workOrder: WorkOrder, isSelected: boolean) => void;
}

const WorkOrdersTable: React.FC<WorkOrdersTableProps> = ({ 
  workOrders, 
  selectedWorkOrders, 
  onSelectWorkOrder 
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

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-12 checkbox-cell">
              <span className="sr-only">Select</span>
            </TableHead>
            <TableHead>Work Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workOrders.length > 0 ? (
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
                <TableCell className="font-medium">{workOrder.id}</TableCell>
                <TableCell>{workOrder.customer}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {workOrder.description}
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
                <TableCell>{workOrder.date}</TableCell>
                <TableCell>{workOrder.dueDate}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No work orders found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkOrdersTable;
