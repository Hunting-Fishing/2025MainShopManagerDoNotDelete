
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";
import { WorkOrderPart } from "@/types/workOrderPart";
import { PartsAndLaborTab } from "./PartsAndLaborTab";
import { WorkOrderInventorySection } from "../inventory/WorkOrderInventorySection";
import { TimeTrackingSection } from "../time-tracking/TimeTrackingSection";
import { WorkOrderCommunications } from "../communications/WorkOrderCommunications";

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
  inventoryItems: WorkOrderInventoryItem[];
  notes: string;
  onUpdateNotes: (notes: string) => void;
  jobLines: WorkOrderJobLine[];
  parts: WorkOrderPart[];
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  jobLinesLoading: boolean;
  isEditMode?: boolean;
}

export function WorkOrderDetailsTabs({
  workOrder,
  timeEntries,
  onUpdateTimeEntries,
  inventoryItems,
  notes,
  onUpdateNotes,
  jobLines,
  parts,
  onJobLinesChange,
  jobLinesLoading,
  isEditMode = false
}: WorkOrderDetailsTabsProps) {
  const handleUpdateTimeEntries = (entries: any) => {
    console.log('Time entries updated:', entries);
    onUpdateTimeEntries(entries);
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="time">Time Tracking</TabsTrigger>
        <TabsTrigger value="communications">Communications</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <PartsAndLaborTab
          workOrder={workOrder}
          jobLines={jobLines}
          allParts={parts}
          onJobLinesChange={onJobLinesChange}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="inventory" className="mt-6">
        <WorkOrderInventorySection
          workOrderId={workOrder.id}
          inventoryItems={inventoryItems}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="time" className="mt-6">
        <TimeTrackingSection
          workOrderId={workOrder.id}
          timeEntries={timeEntries}
          onUpdateTimeEntries={handleUpdateTimeEntries}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="communications" className="mt-6">
        <WorkOrderCommunications workOrder={workOrder} />
      </TabsContent>
    </Tabs>
  );
}
