
import React from "react";
import { statusConfig } from "@/utils/workOrders/statusManagement";
import { WorkOrder } from "@/types/workOrder";

interface StatusBadgeProps {
  status: WorkOrder["status"];
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const config = statusConfig[status] || statusConfig["pending"];
  
  return (
    <span className={`text-sm px-3 py-1 rounded-full font-medium border inline-flex items-center ${config.color} ${className}`}>
      {config.label}
    </span>
  );
};
