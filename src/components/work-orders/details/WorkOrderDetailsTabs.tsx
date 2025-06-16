
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrder } from "@/types/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";
import { WorkOrderPart } from "@/types/workOrderPart";
import { TimeEntry } from "@/types/workOrder";
import { WorkOrderUnifiedHeader } from "./WorkOrderUnifiedHeader";
import { WorkOrderDetailsTab } from "./WorkOrderDetailsTab";
import { WorkOrderPartsSection } from "../parts/WorkOrderPartsSection";
import { TimeTrackingSection } from "../time-tracking/TimeTrackingSection";
import { WorkOrderDocuments } from "./WorkOrderDocuments";
import { WorkOrderCommunications } from "../communications/WorkOrderCommunications";
import { JobLinesSection } from "../form-fields/JobLinesSection";
import { WorkOrderDetailsActions } from "./WorkOrderDetailsActions";
import { WorkOrderStatusUpdate } from "./WorkOrderStatusUpdate";

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  customer?: import('@/types/customer').Customer | null;
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  onTimeEntriesChange: (entries: TimeEntry[]) => void;
  onWorkOrderUpdate?: (updatedWorkOrder: WorkOrder) => void;
  isEditMode: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
}

export function WorkOrderDetailsTabs({
  workOrder,
  jobLines,
  allParts,
  timeEntries,
  customer,
  onJobLinesChange,
  onTimeEntriesChange,
  onWorkOrderUpdate,
  isEditMode,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}: WorkOrderDetailsTabsProps) {
  const [currentWorkOrder, setCurrentWorkOrder] = useState<WorkOrder>(workOrder);

  const handleStatusUpdated = (newStatus: string, updatedWorkOrder?: WorkOrder) => {
    console.log("Status updated in WorkOrderDetailsTabs:", {
      newStatus,
      updatedWorkOrder,
      currentWorkOrder: currentWorkOrder.status
    });
    
    // Update local state with new status
    const updatedWO = updatedWorkOrder || { ...currentWorkOrder, status: newStatus };
    setCurrentWorkOrder(updatedWO);
    
    // Notify parent component if callback provided
    if (onWorkOrderUpdate) {
      onWorkOrderUpdate(updatedWO);
    }
  };

  const handleInvoiceCreated = (invoiceId: string) => {
    console.log("Invoice created (ID):", invoiceId);
    // Could add additional logic here like updating work order status or showing success message
  };

  return (
    <div className="space-y-6">
      {/* Unified Header */}
      <WorkOrderUnifiedHeader
        workOrder={currentWorkOrder}
        customer={customer}
        jobLines={jobLines}
        allParts={allParts}
        timeEntries={timeEntries || []}
      />

      {/* Actions bar - Improved layout */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <WorkOrderStatusUpdate 
            workOrder={currentWorkOrder} 
            onStatusUpdated={handleStatusUpdated} 
          />
          <WorkOrderDetailsActions
            workOrder={currentWorkOrder}
            isEditMode={isEditMode}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
            onInvoiceCreated={handleInvoiceCreated}
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="px-6 py-2">Overview</TabsTrigger>
          <TabsTrigger value="jobs" className="px-6 py-2">Labor & Jobs</TabsTrigger>
          <TabsTrigger value="parts" className="px-6 py-2">Parts</TabsTrigger>
          <TabsTrigger value="time" className="px-6 py-2">Time Tracking</TabsTrigger>
          <TabsTrigger value="documents" className="px-6 py-2">Documents</TabsTrigger>
          <TabsTrigger value="communications" className="px-6 py-2">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <WorkOrderDetailsTab
            workOrder={currentWorkOrder}
            jobLines={jobLines}
            allParts={allParts}
            onJobLinesChange={onJobLinesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-6">
          <JobLinesSection
            workOrderId={currentWorkOrder.id}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>
        
        <TabsContent value="parts" className="space-y-6">
          <WorkOrderPartsSection workOrderId={currentWorkOrder.id} isEditMode={isEditMode} />
        </TabsContent>
        
        <TabsContent value="time" className="space-y-6">
          <TimeTrackingSection
            workOrderId={currentWorkOrder.id}
            timeEntries={timeEntries}
            onUpdateTimeEntries={onTimeEntriesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-6">
          <WorkOrderDocuments workOrderId={currentWorkOrder.id} isEditMode={isEditMode} />
        </TabsContent>
        
        <TabsContent value="communications" className="space-y-6">
          <WorkOrderCommunications workOrder={currentWorkOrder} isEditMode={isEditMode} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
