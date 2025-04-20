
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { WorkOrderStatusType } from "@/types/workOrder";

interface WorkOrderStatusBadgeProps {
  status: WorkOrderStatusType;
}

export function WorkOrderStatusBadge({ status }: WorkOrderStatusBadgeProps) {
  // Define the badge styles based on status
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border border-yellow-300",
    "in-progress": "bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-300",
    completed: "bg-green-100 text-green-800 hover:bg-green-100 border border-green-300",
    cancelled: "bg-slate-100 text-slate-800 hover:bg-slate-100 border border-slate-300"
  };
  
  // Define display text for each status
  const statusText = {
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
    cancelled: "Cancelled"
  };
  
  return (
    <Badge className={statusStyles[status]} variant="outline">
      {statusText[status]}
    </Badge>
  );
}
