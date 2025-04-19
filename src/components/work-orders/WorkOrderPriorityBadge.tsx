
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { WorkOrderPriorityType } from "@/types/workOrder";

interface WorkOrderPriorityBadgeProps {
  priority: WorkOrderPriorityType;
}

export function WorkOrderPriorityBadge({ priority }: WorkOrderPriorityBadgeProps) {
  // Define the badge styles based on priority
  const priorityStyles = {
    low: "bg-green-100 text-green-800 hover:bg-green-100 border border-green-300",
    medium: "bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-300",
    high: "bg-red-100 text-red-800 hover:bg-red-100 border border-red-300"
  };
  
  // Define display text for each priority
  const priorityText = {
    low: "Low",
    medium: "Medium",
    high: "High"
  };
  
  return (
    <Badge className={priorityStyles[priority]} variant="outline">
      {priorityText[priority]}
    </Badge>
  );
}
