
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
