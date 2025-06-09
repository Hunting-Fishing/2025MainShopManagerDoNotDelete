import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Package, FileText, Wrench, History } from 'lucide-react';
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { TimeTrackingSection } from '../time-tracking/TimeTrackingSection';
import { WorkOrderInventorySection } from '../inventory/WorkOrderInventorySection';
import { JobLinesSection } from '../form-fields/JobLinesSection';
interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
  inventoryItems: WorkOrderInventoryItem[];
  notes: string;
  onUpdateNotes: (notes: string) => void;
  jobLines: WorkOrderJobLine[];
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
  onJobLinesChange,
  jobLinesLoading,
  isEditMode = false
}: WorkOrderDetailsTabsProps) {
  return <Tabs defaultValue="services" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-teal-500 rounded">
        <TabsTrigger value="services" className="flex items-center gap-2 text-lg">
          <Wrench className="h-4 w-4" />
          Labor & Services
        </TabsTrigger>
        <TabsTrigger value="time" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Time Tracking
        </TabsTrigger>
        <TabsTrigger value="inventory" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Parts & Inventory
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="services" className="space-y-4">
        <JobLinesSection workOrderId={workOrder.id} description={workOrder.description || ''} jobLines={jobLines} onJobLinesChange={onJobLinesChange} shopId={workOrder.customer_id} isEditMode={isEditMode} />
      </TabsContent>

      <TabsContent value="time" className="space-y-4">
        <TimeTrackingSection workOrderId={workOrder.id} timeEntries={timeEntries} onUpdateTimeEntries={onUpdateTimeEntries} isEditMode={isEditMode} />
      </TabsContent>

      <TabsContent value="inventory" className="space-y-4">
        <WorkOrderInventorySection workOrderId={workOrder.id} inventoryItems={inventoryItems} isEditMode={isEditMode} />
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Work Order History</h3>
          <p>Activity history and changes will be displayed here</p>
        </div>
      </TabsContent>
    </Tabs>;
}