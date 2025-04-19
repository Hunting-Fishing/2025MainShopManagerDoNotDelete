
import React from "react";
import { priorityConfig } from "@/utils/workOrders/statusManagement";
import { WorkOrder } from "@/types/workOrder";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface PriorityBadgeProps {
  priority: WorkOrder["priority"];
  className?: string;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ 
  priority, 
  className = "",
  showIcon = true
}) => {
  const config = priorityConfig[priority] || priorityConfig["medium"];
  
  // Icon mapping
  const IconComponent = () => {
    switch (config.icon) {
      case "ArrowDown":
        return <ArrowDown className="h-3.5 w-3.5 mr-1" />;
      case "ArrowUp":
        return <ArrowUp className="h-3.5 w-3.5 mr-1" />;
      case "Minus":
      default:
        return <Minus className="h-3.5 w-3.5 mr-1" />;
    }
  };
  
  return (
    <span className={`text-sm px-3 py-1 rounded-full font-medium border inline-flex items-center ${config.color} ${className}`}>
      {showIcon && <IconComponent />}
      {config.label}
    </span>
  );
};
