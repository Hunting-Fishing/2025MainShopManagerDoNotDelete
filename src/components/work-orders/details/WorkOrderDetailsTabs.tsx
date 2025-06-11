
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderDetailsTab } from './WorkOrderDetailsTab';
import { WorkOrderTimeTrackingTab } from '../time-tracking/WorkOrderTimeTrackingTab';
import { WorkOrderInventoryTab } from './WorkOrderInventoryTab';
import { WorkOrderNotesTab } from './WorkOrderNotesTab';
import { WorkOrderDocumentsTab } from './WorkOrderDocumentsTab';
import { WorkOrderCommunicationsTab } from './WorkOrderCommunicationsTab';

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
  isEditMode: boolean;
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
  isEditMode
}: WorkOrderDetailsTabsProps) {
  // Extract all parts from job lines
  const allPartsFromJobLines = jobLines.reduce((acc: WorkOrderPart[], jobLine) => {
    if (jobLine.parts && jobLine.parts.length > 0) {
      return [...acc, ...jobLine.parts];
    }
    return acc;
  }, []);

  // Combine standalone parts with parts from job lines
  const allParts = [...parts, ...allPartsFromJobLines];

  console.log('WorkOrderDetailsTabs - jobLines received:', jobLines);
  console.log('WorkOrderDetailsTabs - allParts calculated:', allParts);

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="parts">Parts</TabsTrigger>
        <TabsTrigger value="labor">Labor</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="time">Time Tracking</TabsTrigger>
        <TabsTrigger value="communications">Communications</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <WorkOrderDetailsTab
          workOrder={workOrder}
          jobLines={jobLines}
          allParts={allParts}
          onJobLinesChange={onJobLinesChange}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="parts" className="mt-6">
        <div className="text-center py-8 text-muted-foreground">
          Parts management coming soon...
        </div>
      </TabsContent>

      <TabsContent value="labor" className="mt-6">
        <div className="text-center py-8 text-muted-foreground">
          Labor tracking coming soon...
        </div>
      </TabsContent>

      <TabsContent value="inventory" className="mt-6">
        <WorkOrderInventoryTab
          workOrder={workOrder}
          inventoryItems={inventoryItems}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="time" className="mt-6">
        <WorkOrderTimeTrackingTab
          workOrder={workOrder}
          timeEntries={timeEntries}
          onUpdateTimeEntries={onUpdateTimeEntries}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="communications" className="mt-6">
        <WorkOrderCommunicationsTab
          workOrder={workOrder}
          isEditMode={isEditMode}
        />
      </TabsContent>
    </Tabs>
  );
}
