
import React from "react";
import { priorityConfig } from "@/utils/workOrders/statusManagement";
import { WorkOrder } from "@/types/workOrder";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface PriorityBadgeProps {
  priority: WorkOrder["priority"];
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = "" }) => {
  const config = priorityConfig[priority] || priorityConfig["medium"];
  
  const PriorityIcon = () => {
    switch (priority) {
      case "high":
        return <ArrowUp className="h-3.5 w-3.5 mr-1" />;
      case "low":
        return <ArrowDown className="h-3.5 w-3.5 mr-1" />;
      default:
        return <Minus className="h-3.5 w-3.5 mr-1" />;
    }
  };
  
  return (
    <span className={`text-sm px-3 py-1 rounded-full font-medium border inline-flex items-center ${config.color} ${className}`}>
      <PriorityIcon />
      {config.label}
    </span>
  );
};
