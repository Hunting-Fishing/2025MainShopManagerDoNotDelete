
import React from "react";
import { Badge } from "@/components/ui/badge";
import { WorkOrder } from "@/types/workOrder";
import { statusConfig } from "@/utils/workOrders/statusManagement";

interface StatusBadgeProps {
  status: WorkOrder["status"];
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const config = statusConfig[status] || statusConfig["pending"];
  
  return (
    <Badge className={`${config.color} ${className}`}>
      {config.label}
    </Badge>
  );
};
