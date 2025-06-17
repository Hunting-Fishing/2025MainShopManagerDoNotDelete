
import React from "react";
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
  onJobLineUpdate?: (jobLine: WorkOrderJobLine) => Promise<void>;
  onJobLineDelete?: (jobLineId: string) => Promise<void>;
  onPartUpdate?: (part: WorkOrderPart) => Promise<void>;
  onPartDelete?: (partId: string) => Promise<void>;
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
  onJobLineUpdate,
  onJobLineDelete,
  onPartUpdate,
  onPartDelete,
  isEditMode,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}: WorkOrderDetailsTabsProps) {
  const handleStatusUpdated = (newStatus: string) => {
    console.log("Work order status updated:", newStatus);
  };

  const handleInvoiceCreated = (invoiceId: string) => {
    console.log("Invoice created (ID):", invoiceId);
  };

  return (
    <div className="space-y-6">
      <WorkOrderUnifiedHeader
        workOrder={workOrder}
        customer={customer}
        jobLines={jobLines}
        allParts={allParts}
        timeEntries={timeEntries || []}
      />

      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <WorkOrderStatusUpdate workOrder={workOrder} onStatusUpdated={handleStatusUpdated} />
          <WorkOrderDetailsActions
            workOrder={workOrder}
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
            workOrder={workOrder}
            jobLines={jobLines}
            allParts={allParts}
            onJobLinesChange={onJobLinesChange}
            onJobLineUpdate={onJobLineUpdate}
            onJobLineDelete={onJobLineDelete}
            onPartUpdate={onPartUpdate}
            onPartDelete={onPartDelete}
            isEditMode={isEditMode}
          />
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-6">
          <JobLinesSection
            workOrderId={workOrder.id}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
            onJobLineUpdate={onJobLineUpdate}
            onJobLineDelete={onJobLineDelete}
            isEditMode={isEditMode}
          />
        </TabsContent>
        
        <TabsContent value="parts" className="space-y-6">
          <WorkOrderPartsSection 
            workOrderId={workOrder.id} 
            isEditMode={isEditMode}
            onPartUpdate={onPartUpdate}
            onPartDelete={onPartDelete}
          />
        </TabsContent>
        
        <TabsContent value="time" className="space-y-6">
          <TimeTrackingSection
            workOrderId={workOrder.id}
            timeEntries={timeEntries}
            onUpdateTimeEntries={onTimeEntriesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-6">
          <WorkOrderDocuments workOrderId={workOrder.id} isEditMode={isEditMode} />
        </TabsContent>
        
        <TabsContent value="communications" className="space-y-6">
          <WorkOrderCommunications workOrder={workOrder} isEditMode={isEditMode} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
