
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { WorkOrder } from "@/types/workOrder";
import { 
  ClipboardList, 
  CalendarDays, 
  User, 
  MapPin,
  Car
} from "lucide-react";
import { format } from "date-fns";
import { WorkOrderPriorityBadge } from "../WorkOrderPriorityBadge";
import { WorkOrderStatusBadge } from "../WorkOrderStatusBadge";

interface WorkOrderDetailsProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetails({ workOrder }: WorkOrderDetailsProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader className="bg-slate-50 pb-3 border-b">
        <CardTitle className="text-lg font-medium flex items-center">
          <ClipboardList className="mr-2 h-5 w-5" />
          Work Order Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header with ID, status and priority */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{workOrder.description}</h2>
              <p className="text-sm text-slate-500">ID: {workOrder.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <WorkOrderStatusBadge status={workOrder.status} />
              <WorkOrderPriorityBadge priority={workOrder.priority} />
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Customer</p>
                  <p>{workOrder.customer}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Technician</p>
                  <p>{workOrder.technician}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Location</p>
                  <p>{workOrder.location}</p>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Created Date</p>
                  <p>{formatDate(workOrder.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Due Date</p>
                  <p>{formatDate(workOrder.dueDate)}</p>
                </div>
              </div>

              {workOrder.vehicleDetails && (
                <div className="flex items-start gap-3">
                  <Car className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-500">Vehicle</p>
                    <p>
                      {workOrder.vehicleDetails.year} {workOrder.vehicleDetails.make} {workOrder.vehicleDetails.model}
                      {workOrder.vehicleDetails.licensePlate && ` (${workOrder.vehicleDetails.licensePlate})`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes section */}
          {workOrder.notes && (
            <div className="pt-4 border-t">
              <p className="text-sm font-medium text-slate-500 mb-2">Notes</p>
              <p className="whitespace-pre-line">{workOrder.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
