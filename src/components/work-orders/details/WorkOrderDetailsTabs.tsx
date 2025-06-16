
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
    <div className="space-y-4">
      {/* Unified Header */}
      <WorkOrderUnifiedHeader
        workOrder={workOrder}
        customer={customer}
        jobLines={jobLines}
        allParts={allParts}
        timeEntries={timeEntries || []}
      />

      {/* Actions bar */}
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 max-w-full overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <WorkOrderDetailsTab
            workOrder={workOrder}
            jobLines={jobLines}
            allParts={allParts}
            onJobLinesChange={onJobLinesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>
        <TabsContent value="jobs">
          <JobLinesSection
            workOrderId={workOrder.id}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>
        <TabsContent value="parts">
          <WorkOrderPartsSection workOrderId={workOrder.id} isEditMode={isEditMode} />
        </TabsContent>
        <TabsContent value="time">
          <TimeTrackingSection
            workOrderId={workOrder.id}
            timeEntries={timeEntries}
            onUpdateTimeEntries={onTimeEntriesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>
        <TabsContent value="documents">
          <WorkOrderDocuments workOrderId={workOrder.id} />
        </TabsContent>
        <TabsContent value="communications">
          <WorkOrderCommunications workOrder={workOrder} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
