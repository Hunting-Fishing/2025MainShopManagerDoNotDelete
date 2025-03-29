
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { WorkOrder } from "@/data/workOrdersData";

interface WorkOrderInformationProps {
  workOrder: WorkOrder;
}

export function WorkOrderInformation({ workOrder }: WorkOrderInformationProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card>
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-lg">Work Order Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-500">Customer</h3>
            <p className="mt-1">{workOrder.customer}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-500">Location</h3>
            <p className="mt-1">{workOrder.location}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-500">Description</h3>
            <p className="mt-1">{workOrder.description}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-500">Technician</h3>
            <p className="mt-1">{workOrder.technician}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-500">Created On</h3>
            <p className="mt-1">{formatDate(workOrder.date)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-500">Due Date</h3>
            <p className="mt-1">{formatDate(workOrder.dueDate)}</p>
          </div>
        </div>
        
        {workOrder.notes && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-500">Notes</h3>
            <p className="mt-1 whitespace-pre-wrap">{workOrder.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
