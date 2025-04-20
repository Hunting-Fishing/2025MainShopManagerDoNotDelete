
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkOrder } from "@/types/workOrder";
import { format } from "date-fns";

interface WorkOrderInvoiceStatusProps {
  workOrder: WorkOrder;
}

export function WorkOrderInvoiceStatus({ workOrder }: WorkOrderInvoiceStatusProps) {
  if (!workOrder.invoice_id) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Invoice Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Invoice ID:</span>
            <Link 
              to={`/invoices/${workOrder.invoice_id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {workOrder.invoice_id}
            </Link>
          </div>
          {workOrder.invoiced_at && (
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Invoiced On:</span>
              <span className="text-sm">
                {format(new Date(workOrder.invoiced_at), 'MMM dd, yyyy')}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
