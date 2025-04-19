
import React from "react";
import { WorkOrder } from "@/types/workOrder";
import { statusConfig } from "@/utils/workOrders/statusManagement";
import { Clock, Check, X, PlayCircle } from "lucide-react";

interface StatusBadgeProps {
  status: WorkOrder["status"];
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const config = statusConfig[status] || statusConfig["pending"];
  
  const StatusIcon = () => {
    switch (status) {
      case "pending":
        return <Clock className="h-3.5 w-3.5 mr-1" />;
      case "in-progress":
        return <PlayCircle className="h-3.5 w-3.5 mr-1" />;
      case "completed":
        return <Check className="h-3.5 w-3.5 mr-1" />;
      case "cancelled":
        return <X className="h-3.5 w-3.5 mr-1" />;
      default:
        return <Clock className="h-3.5 w-3.5 mr-1" />;
    }
  };
  
  return (
    <span className={`text-sm px-3 py-1 rounded-full font-medium border inline-flex items-center ${config.color} ${className}`}>
      <StatusIcon />
      {config.label}
    </span>
  );
};
