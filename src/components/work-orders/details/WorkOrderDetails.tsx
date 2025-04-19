
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { WorkOrder } from "@/types/workOrder";
import { formatRelative } from "date-fns";
import { WorkOrderStatusBadge } from "@/components/work-orders/WorkOrderStatusBadge";
import { WorkOrderPriorityBadge } from "@/components/work-orders/WorkOrderPriorityBadge";
import { Separator } from "@/components/ui/separator";
import { WorkOrderInventoryItems } from "./WorkOrderInventoryItems";
import { Clock, MapPin, Tool, User } from "lucide-react";

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetails({ workOrder }: WorkOrderDetailsProps) {
  const creationDate = workOrder.createdAt 
    ? formatRelative(new Date(workOrder.createdAt), new Date()) 
    : "Unknown";

  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Work Order Details</h3>
            <div className="flex items-center space-x-2">
              <WorkOrderStatusBadge status={workOrder.status} />
              <WorkOrderPriorityBadge priority={workOrder.priority} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Customer</div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>{workOrder.customer}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Technician</div>
                <div className="flex items-center space-x-2">
                  <Tool className="h-4 w-4 text-muted-foreground" />
                  <div>{workOrder.technician || "Unassigned"}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Location</div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>{workOrder.location || "Not specified"}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Created</div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>{creationDate}</div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Description</div>
              <div className="text-sm">{workOrder.description}</div>
            </div>

            {workOrder.notes && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Notes</div>
                <div className="text-sm whitespace-pre-wrap">{workOrder.notes}</div>
              </div>
            )}

            {workOrder.serviceCategory && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Service Category</div>
                <div className="text-sm">{workOrder.serviceCategory}</div>
              </div>
            )}

            {workOrder.serviceType && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Service Type</div>
                <div className="text-sm">{workOrder.serviceType}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Items Card */}
      <WorkOrderInventoryItems workOrder={workOrder} />
    </div>
  );
}
