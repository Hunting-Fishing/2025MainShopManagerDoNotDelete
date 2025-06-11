
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Package, FileText, Wrench, History, Users, BarChart3 } from 'lucide-react';
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { TimeTrackingSection } from '../time-tracking/TimeTrackingSection';
import { WorkOrderInventorySection } from '../inventory/WorkOrderInventorySection';
import { JobLinesSection } from '../form-fields/JobLinesSection';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { PartsAndLaborTab } from './PartsAndLaborTab';

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
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg shadow-lg">
        <TabsTrigger 
          value="overview" 
          className="flex items-center gap-2 text-sm data-[state=active]:bg-white data-[state=active]:text-teal-700 text-white"
        >
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger 
          value="services" 
          className="flex items-center gap-2 text-sm data-[state=active]:bg-white data-[state=active]:text-teal-700 text-white"
        >
          <Wrench className="h-4 w-4" />
          <span className="hidden sm:inline">Labor</span>
        </TabsTrigger>
        <TabsTrigger 
          value="parts" 
          className="flex items-center gap-2 text-sm data-[state=active]:bg-white data-[state=active]:text-teal-700 text-white"
        >
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Parts</span>
        </TabsTrigger>
        <TabsTrigger 
          value="time" 
          className="flex items-center gap-2 text-sm data-[state=active]:bg-white data-[state=active]:text-teal-700 text-white"
        >
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">Time</span>
        </TabsTrigger>
        <TabsTrigger 
          value="inventory" 
          className="flex items-center gap-2 text-sm data-[state=active]:bg-white data-[state=active]:text-teal-700 text-white"
        >
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Inventory</span>
        </TabsTrigger>
        <TabsTrigger 
          value="history" 
          className="flex items-center gap-2 text-sm data-[state=active]:bg-white data-[state=active]:text-teal-700 text-white"
        >
          <History className="h-4 w-4" />
          <span className="hidden sm:inline">History</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="overview" className="space-y-4 animate-fade-in">
          <PartsAndLaborTab
            workOrder={workOrder}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="services" className="space-y-4 animate-fade-in">
          <JobLinesSection
            workOrderId={workOrder.id}
            description={workOrder.description || ''}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
            shopId={workOrder.customer_id}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="parts" className="space-y-4 animate-fade-in">
          <WorkOrderPartsSection
            workOrderId={workOrder.id}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="time" className="space-y-4 animate-fade-in">
          <TimeTrackingSection
            workOrderId={workOrder.id}
            timeEntries={timeEntries}
            onUpdateTimeEntries={onUpdateTimeEntries}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4 animate-fade-in">
          <WorkOrderInventorySection
            workOrderId={workOrder.id}
            inventoryItems={inventoryItems}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4 animate-fade-in">
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <History className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Work Order History</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Activity history, status changes, and audit trail will be displayed here to track all modifications made to this work order.
            </p>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
}
