
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { statusMap, priorityMap, WorkOrder } from "@/data/workOrdersData";
import { formatDate } from "@/utils/workOrderUtils";
import { FileEdit, Trash2, FileText } from "lucide-react";
import { WorkOrderToInvoiceConverter } from "@/components/invoices/WorkOrderToInvoiceConverter";

interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetailsHeader({ workOrder }: WorkOrderDetailsHeaderProps) {
  const navigate = useNavigate();
  
  const priorityStyle = priorityMap[workOrder.priority]?.classes || "";
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{workOrder.id}</h1>
            <p className="text-lg text-slate-700 mb-4">{workOrder.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-500">Customer</p>
                <p className="font-medium">{workOrder.customer}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <p className="font-medium">{statusMap[workOrder.status]}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Priority</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyle}`}>
                  {priorityMap[workOrder.priority]?.label || workOrder.priority}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Due Date</p>
                <p className="font-medium">{formatDate(workOrder.dueDate)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-500">Technician</p>
                <p className="font-medium">{workOrder.technician}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Location</p>
                <p className="font-medium">{workOrder.location}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Created</p>
                <p className="font-medium">{formatDate(workOrder.date)}</p>
              </div>
              {workOrder.lastUpdatedAt && (
                <div>
                  <p className="text-sm text-slate-500">Last Updated</p>
                  <p className="font-medium">{formatDate(workOrder.lastUpdatedAt.split('T')[0])}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => navigate(`/work-orders/${workOrder.id}/edit`)}
            >
              <FileEdit className="h-4 w-4" />
              Edit
            </Button>
            
            <WorkOrderToInvoiceConverter workOrder={workOrder} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
