
import React from "react";
import { WorkOrder } from "@/types/workOrder";
import { EditFormHeader } from "./edit/EditFormHeader";
import { EditFormWrapper } from "./edit/EditFormWrapper"; 
import { WorkOrderEditFormContent } from "./edit/WorkOrderEditFormContent";
import { useWorkOrderEditForm } from "@/hooks/useWorkOrderEditForm";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface WorkOrderEditFormProps {
  workOrder: WorkOrder;
}

export default function WorkOrderEditForm({ workOrder }: WorkOrderEditFormProps) {
  const { form, onSubmit, isSubmitting, error, timeEntries, setTimeEntries } = useWorkOrderEditForm(workOrder);

  // Mock data for technicians - this would eventually be fetched from API
  const technicians = [
    "Michael Brown",
    "Sarah Johnson",
    "David Lee",
    "Emily Chen",
    "Unassigned",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <EditFormHeader workOrderId={workOrder.id} />

      {/* Show error if any */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Form Content */}
      <Card className="p-6">
        <EditFormWrapper form={form} onSubmit={onSubmit}>
          <WorkOrderEditFormContent
            workOrderId={workOrder.id}
            technicians={technicians}
            form={form}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
        </EditFormWrapper>
      </Card>
    </div>
  );
}
