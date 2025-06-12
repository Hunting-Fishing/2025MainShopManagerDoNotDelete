
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";
import { WorkOrderPart } from "@/types/workOrderPart";
import { PartsAndLaborTab } from "./PartsAndLaborTab";
import { WorkOrderInventorySection } from "../inventory/WorkOrderInventorySection";
import { TimeTrackingSection } from "../time-tracking/TimeTrackingSection";
import { WorkOrderCommunications } from "../communications/WorkOrderCommunications";
import { WorkOrderPartsSection } from "../parts/WorkOrderPartsSection";
import { WorkOrderLaborSection } from "../labor/WorkOrderLaborSection";
import { CreateWorkOrderTab } from "./CreateWorkOrderTab";

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
  onPartsChange?: (parts: WorkOrderPart[]) => void;
  jobLinesLoading: boolean;
  isEditMode?: boolean;
  isCreateMode?: boolean;
  onCreateWorkOrder?: (data: any) => Promise<void>;
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
  onPartsChange,
  jobLinesLoading,
  isEditMode = false,
  isCreateMode = false,
  onCreateWorkOrder
}: WorkOrderDetailsTabsProps) {
  const handleUpdateTimeEntries = (entries: any) => {
    console.log('Time entries updated:', entries);
    onUpdateTimeEntries(entries);
  };

  // If in create mode, show a simplified tab layout focused on creation
  if (isCreateMode) {
    return (
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-1 bg-emerald-400">
          <TabsTrigger value="create">Create Work Order</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <CreateWorkOrderTab 
            workOrder={workOrder}
            onCreateWorkOrder={onCreateWorkOrder}
          />
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-6 bg-emerald-400">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="parts">Parts</TabsTrigger>
        <TabsTrigger value="labor">Labor</TabsTrigger>
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
          onPartsChange={onPartsChange}
          isEditMode={isEditMode} 
        />
      </TabsContent>

      <TabsContent value="parts" className="mt-6">
        <WorkOrderPartsSection workOrderId={workOrder.id} isEditMode={isEditMode} />
      </TabsContent>

      <TabsContent value="labor" className="mt-6">
        <WorkOrderLaborSection 
          workOrderId={workOrder.id} 
          jobLines={jobLines} 
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
