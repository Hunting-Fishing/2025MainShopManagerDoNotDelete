
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkOrder } from "@/types/workOrder";
import { formatDate } from "@/utils/workOrders/formatters";
import { ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusConfig } from "@/utils/workOrders/statusManagement";

interface WorkOrderStatusTimelineProps {
  workOrder: WorkOrder;
}

export function WorkOrderStatusTimeline({ workOrder }: WorkOrderStatusTimelineProps) {
  // For a real implementation, we would fetch the status history from the backend
  // For now, we'll just show the current status
  
  const statusInfo = statusConfig[workOrder.status];
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <ClipboardList className="h-5 w-5 mr-2 text-muted-foreground" />
          <CardTitle className="text-lg">Work Order Details</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">ID</div>
            <div>{workOrder.id}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">Customer</div>
            <div>{workOrder.customer}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">Technician</div>
            <div>{workOrder.technician || "Unassigned"}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">Created Date</div>
            <div>{formatDate(workOrder.date)}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">Due Date</div>
            <div>{formatDate(workOrder.dueDate)}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">Priority</div>
            <div className="capitalize">{workOrder.priority}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">Status</div>
            <div>
              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                statusInfo.color
              )}>
                {statusInfo.label}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">Location</div>
            <div>{workOrder.location || "N/A"}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground">Service Type</div>
            <div>{workOrder.serviceType || "N/A"}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Description</div>
          <div className="whitespace-pre-wrap">{workOrder.description}</div>
        </div>
      </CardContent>
    </Card>
  );
}
