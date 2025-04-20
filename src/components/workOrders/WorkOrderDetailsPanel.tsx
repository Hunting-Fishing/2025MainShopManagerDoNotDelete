import React from "react";
import { WorkOrder } from "@/types/workOrder";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { CalendarDays, MapPin, User, Wrench, ClipboardList } from "lucide-react";
import { StatusUpdateButton } from "./StatusUpdateButton";
import { StatusUpdateDialog } from "./StatusUpdateDialog";
import { getNextStatusOptions } from "@/utils/workOrders/statusManagement";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { WorkOrderStatusHistory } from "./details/WorkOrderStatusHistory";
import { WorkOrderNotifications } from "./notifications/WorkOrderNotifications";

interface WorkOrderDetailsPanelProps {
  workOrder: WorkOrder;
  userId: string;
  userName: string;
  onStatusUpdate: (updatedWorkOrder: WorkOrder) => void;
}

export function WorkOrderDetailsPanel({ 
  workOrder,
  userId,
  userName,
  onStatusUpdate
}: WorkOrderDetailsPanelProps) {
  const nextStatuses = getNextStatusOptions(workOrder.status);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">{workOrder.description}</h3>
              <p className="text-muted-foreground">ID: {workOrder.id}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <StatusBadge status={workOrder.status} />
              <PriorityBadge priority={workOrder.priority} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Customer</p>
                  <p>{workOrder.customer}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Wrench className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Technician</p>
                  <p>{workOrder.technician}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p>{workOrder.location}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Created Date</p>
                  <p>{workOrder.createdAt ? format(new Date(workOrder.createdAt), 'MMM dd, yyyy') : workOrder.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Due Date</p>
                  <p>{format(new Date(workOrder.dueDate), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ClipboardList className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Service Type</p>
                  <p>{workOrder.serviceType || workOrder.service_type || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Status Actions</h4>
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((status) => (
                <StatusUpdateButton
                  key={status.status}
                  workOrder={workOrder}
                  newStatus={status.status}
                  userId={userId}
                  userName={userName}
                  onStatusUpdate={onStatusUpdate}
                  size="sm"
                />
              ))}
              
              <StatusUpdateDialog 
                workOrder={workOrder} 
                userId={userId} 
                userName={userName} 
                onStatusUpdate={onStatusUpdate}
              >
                <Button variant="outline" size="sm">
                  More Status Options
                </Button>
              </StatusUpdateDialog>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <WorkOrderStatusHistory workOrderId={workOrder.id} />
        <WorkOrderNotifications workOrderId={workOrder.id} />
      </div>
    </div>
  );
}
