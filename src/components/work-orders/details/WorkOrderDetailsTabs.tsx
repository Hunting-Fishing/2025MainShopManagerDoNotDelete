import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrder } from "@/types/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";
import { WorkOrderPart } from "@/types/workOrderPart";
import { TimeEntry } from "@/types/workOrder";
import { WorkOrderDetailsHeader } from "./WorkOrderDetailsHeader";
import { WorkOrderOverviewHeader } from "./WorkOrderOverviewHeader";
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
}: WorkOrderDetailsTabsProps) {
  // Handler for status change (optional: refresh work order or propagate up if you wish)
  const handleStatusUpdated = (newStatus: string) => {
    // Optionally, refetch workOrder or call onJobLinesChange/onTimeEntriesChange if needed
    // This could also be a toast notification, etc.
    // For now just log for debug.
    console.log("Work order status updated:", newStatus);
  };

  // Handler for invoice conversion and redirect, can be implemented as you like
  const handleInvoiceCreated = (invoiceId: string) => {
    // Optionally, navigate or show a toast
    console.log("Invoice created (ID):", invoiceId);
    // Example: window.location.href = `/invoices/${invoiceId}`
  };

  // Handler for edit
  const handleEdit = () => {
    window.location.href = `/work-orders/${workOrder.id}/edit`;
  };

  return (
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
        {/* Add actions and status update bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          {/* Editable status */}
          <WorkOrderStatusUpdate workOrder={workOrder} onStatusUpdated={handleStatusUpdated} />
          {/* Actions */}
          <WorkOrderDetailsActions
            workOrder={workOrder}
            onEdit={handleEdit}
            onInvoiceCreated={handleInvoiceCreated}
          />
        </div>

        <WorkOrderDetailsHeader workOrder={workOrder} customer={customer} />
        <WorkOrderOverviewHeader
          workOrder={workOrder}
          jobLines={jobLines}
          allParts={allParts}
          timeEntries={timeEntries || []}
        />
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
  );
}
