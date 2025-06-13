
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrderPartsSection } from "./parts/WorkOrderPartsSection";
import { TimeTrackingSection } from "./time-tracking/TimeTrackingSection";
import { WorkOrderDocuments } from "./details/WorkOrderDocuments";
import { WorkOrderCommunications } from "./communications/WorkOrderCommunications";
import { WorkOrder } from "@/types/workOrder";
import { TimeEntry } from "@/types/workOrder";

interface WorkOrderTabsProps {
  workOrder: WorkOrder;
  timeEntries?: TimeEntry[];
  onUpdateTimeEntries?: (entries: TimeEntry[]) => void;
  isEditMode?: boolean;
}

export const WorkOrderTabs: React.FC<WorkOrderTabsProps> = ({
  workOrder,
  timeEntries = [],
  onUpdateTimeEntries,
  isEditMode = false
}) => {
  return (
    <Tabs defaultValue="parts">
      <TabsList className="mb-4">
        <TabsTrigger value="parts">Parts & Inventory</TabsTrigger>
        <TabsTrigger value="time">Time Tracking</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="communications">Communications</TabsTrigger>
      </TabsList>

      <TabsContent value="parts">
        <WorkOrderPartsSection
          workOrderId={workOrder.id}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="time">
        <TimeTrackingSection
          workOrderId={workOrder.id}
          timeEntries={timeEntries}
          onUpdateTimeEntries={onUpdateTimeEntries || (() => {})}
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
};
