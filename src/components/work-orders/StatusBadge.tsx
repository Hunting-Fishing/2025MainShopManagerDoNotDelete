
import React from "react";
import { Badge } from "@/components/ui/badge";
import { WorkOrder } from "@/types/workOrder";
import { statusConfig, getStatusIcon } from "@/utils/workOrders/statusManagement";

interface StatusBadgeProps {
  status: WorkOrder["status"];
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "default" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className = "",
  showIcon = true,
  size = "default"
}) => {
  const config = statusConfig[status] || statusConfig["pending"];
  const StatusIcon = showIcon ? getStatusIcon(status) : null;
  
  const sizeClasses = {
    sm: "text-xs py-0 px-2",
    default: "text-sm py-1 px-3",
    lg: "py-1.5 px-4"
  };
  
  return (
    <Badge className={`${config.color} ${className} ${sizeClasses[size]} flex items-center gap-1.5`}>
      {showIcon && StatusIcon && <StatusIcon className="h-3.5 w-3.5" />}
      {config.label}
    </Badge>
  );
};
