
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Edit, FilePlus } from "lucide-react";
import { WorkOrder, priorityMap, statusMap } from "@/data/workOrdersData";
import { WorkOrderExportMenu } from "../WorkOrderExportMenu";

interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetailsHeader({ workOrder }: WorkOrderDetailsHeaderProps) {
  const navigate = useNavigate();
  
  // Get status and priority info
  const statusInfo = statusMap[workOrder.status as keyof typeof statusMap];
  const priorityInfo = priorityMap[workOrder.priority as keyof typeof priorityMap];

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle creating invoice
  const handleCreateInvoice = () => {
    navigate(`/invoices/create/${workOrder.id}`);
  };

  // Handle edit work order
  const handleEditWorkOrder = () => {
    navigate(`/work-orders/${workOrder.id}/edit`);
  };

  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{workOrder.id}</h1>
        <div className="flex items-center mt-2 space-x-4">
          {/* Status badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            workOrder.status === "completed" ? "bg-green-100 text-green-800" : 
            workOrder.status === "in-progress" ? "bg-blue-100 text-blue-800" :
            workOrder.status === "pending" ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          }`}>
            {statusInfo}
          </span>
          
          {/* Priority badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.classes}`}>
            {priorityInfo.label} Priority
          </span>
          
          {/* Date */}
          <span className="inline-flex items-center text-sm text-slate-500">
            <CalendarIcon className="mr-1 h-4 w-4" />
            Created: {formatDate(workOrder.date)}
          </span>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <WorkOrderExportMenu workOrder={workOrder} />
        <Button variant="outline" onClick={handleEditWorkOrder}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Work Order
        </Button>
        <Button onClick={handleCreateInvoice}>
          <FilePlus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>
    </div>
  );
}
