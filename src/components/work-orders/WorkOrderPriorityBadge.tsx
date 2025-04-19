
import React from "react";
import { WorkOrderPriorityType } from "@/types/workOrder";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface WorkOrderPriorityBadgeProps {
  priority: WorkOrderPriorityType;
  className?: string;
}

export function WorkOrderPriorityBadge({ priority, className = "" }: WorkOrderPriorityBadgeProps) {
  const config = {
    "low": {
      label: "Low",
      color: "bg-green-100 text-green-800 border border-green-200",
      icon: <ArrowDown className="h-3.5 w-3.5 mr-1" />
    },
    "medium": {
      label: "Medium",
      color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      icon: <Minus className="h-3.5 w-3.5 mr-1" />
    },
    "high": {
      label: "High",
      color: "bg-red-100 text-red-800 border border-red-200",
      icon: <ArrowUp className="h-3.5 w-3.5 mr-1" />
    }
  };
  
  const priorityConfig = config[priority] || config["medium"];
  
  return (
    <span className={`text-sm px-3 py-1 rounded-full font-medium inline-flex items-center ${priorityConfig.color} ${className}`}>
      {priorityConfig.icon}
      {priorityConfig.label}
    </span>
  );
}
