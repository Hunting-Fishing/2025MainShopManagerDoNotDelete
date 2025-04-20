
import React from "react";
import { WorkOrder } from "@/types/workOrder";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Printer } from "lucide-react";
import { generateWorkOrderPdf } from "@/utils/pdf/workOrderPdf";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { statusConfig } from "@/utils/workOrders/statusManagement";

interface WorkOrderHeaderProps {
  workOrder: WorkOrder;
  onBack: () => void;
  onEdit?: () => void;
}

export function WorkOrderHeader({ workOrder, onBack, onEdit }: WorkOrderHeaderProps) {
  const handlePrintWorkOrder = () => {
    try {
      const pdf = generateWorkOrderPdf(workOrder);
      pdf.save(`WorkOrder-${workOrder.id}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Work order PDF has been generated successfully."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Work Order Details</h1>
            <p className="text-sm text-muted-foreground">
              #{workOrder.id.substring(0, 8)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handlePrintWorkOrder}
            className="flex items-center gap-1"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          {onEdit && (
            <Button 
              onClick={onEdit}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Badge 
          className={`${statusConfig[workOrder.status]?.color || ''} text-sm px-3 py-1`}
        >
          {statusConfig[workOrder.status]?.label || workOrder.status}
        </Badge>
        
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Customer:</span> {workOrder.customer}
        </div>
        
        {workOrder.vehicle_make && workOrder.vehicle_model && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Vehicle:</span> {workOrder.vehicle_make} {workOrder.vehicle_model}
          </div>
        )}
        
        {workOrder.technician && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Technician:</span> {workOrder.technician}
          </div>
        )}
      </div>
    </div>
  );
}
