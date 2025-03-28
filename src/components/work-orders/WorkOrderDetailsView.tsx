
import { Link } from "react-router-dom";
import { Edit, FileText } from "lucide-react";
import { WorkOrder, statusMap, priorityMap } from "@/data/workOrdersData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/workOrderUtils";

interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

export default function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  if (!workOrder) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Work Order: {workOrder.id}</h1>
          <p className="text-muted-foreground">{workOrder.description}</p>
        </div>
        <div className="flex space-x-4">
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link to={`/invoices/from-work-order/${workOrder.id}`}>
              <FileText className="h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
          <Button asChild className="flex items-center gap-2 bg-esm-blue-600 hover:bg-esm-blue-700">
            <Link to={`/work-orders/${workOrder.id}/edit`}>
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main details card */}
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Customer</p>
                  <p className="text-base">{workOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Location</p>
                  <p className="text-base">{workOrder.location}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-slate-500">Description</p>
                <p className="text-base">{workOrder.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Status</p>
                  <div className="mt-1">
                    <span className={`status-badge status-${workOrder.status}`}>
                      {statusMap[workOrder.status]}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Priority</p>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityMap[workOrder.priority].classes}`}>
                      {priorityMap[workOrder.priority].label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment card */}
        <Card>
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg">Assignment</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Assigned Technician</p>
                <p className="text-base">{workOrder.technician}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Created Date</p>
                  <p className="text-base">{formatDate(workOrder.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Due Date</p>
                  <p className="text-base">{formatDate(workOrder.dueDate)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
