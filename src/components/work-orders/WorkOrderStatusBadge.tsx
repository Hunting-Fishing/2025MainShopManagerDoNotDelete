
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";
import { WorkOrderStatusType } from "@/types/workOrder";

interface WorkOrderStatusBadgeProps {
  status: WorkOrderStatusType;
  className?: string;
}

export function WorkOrderStatusBadge({ status, className = "" }: WorkOrderStatusBadgeProps) {
  const config = {
    "pending": {
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
      icon: <Clock className="h-3.5 w-3.5 mr-1" />
    },
    "in-progress": {
      label: "In Progress",
      color: "bg-blue-100 text-blue-800 border border-blue-200",
      icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />
    },
    "completed": {
      label: "Completed",
      color: "bg-green-100 text-green-800 border border-green-200",
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
    },
    "cancelled": {
      label: "Cancelled",
      color: "bg-red-100 text-red-800 border border-red-200",
      icon: <XCircle className="h-3.5 w-3.5 mr-1" />
    }
  };
  
  const statusConfig = config[status] || config["pending"];
  
  return (
    <span className={`text-sm px-3 py-1 rounded-full font-medium inline-flex items-center ${statusConfig.color} ${className}`}>
      {statusConfig.icon}
      {statusConfig.label}
    </span>
  );
}
