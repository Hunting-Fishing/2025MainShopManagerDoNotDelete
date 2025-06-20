import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { WorkOrderOverviewTab } from './WorkOrderOverviewTab';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { JobLinesSection } from '../form-fields/JobLinesSection';
import { WorkOrderActivityTab } from './WorkOrderActivityTab';

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  customer: Customer | null;
  onWorkOrderUpdate: (workOrder: WorkOrder) => void;
  onPartsChange: () => Promise<void>;
  isEditMode: boolean;
}

export function WorkOrderDetailsTabs({
  workOrder,
  jobLines,
  allParts,
  timeEntries,
  customer,
  onWorkOrderUpdate,
  onPartsChange,
  isEditMode
}: WorkOrderDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="parts">Parts</TabsTrigger>
        <TabsTrigger value="labor">Labor</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <WorkOrderOverviewTab
          workOrder={workOrder}
          jobLines={jobLines}
          allParts={allParts}
          timeEntries={timeEntries}
          customer={customer}
          onWorkOrderUpdate={onWorkOrderUpdate}
          onPartsChange={onPartsChange}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="parts" className="mt-6">
        <WorkOrderPartsSection
          workOrderId={workOrder.id}
          parts={allParts}
          onPartsChange={onPartsChange}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="labor" className="mt-6">
        <JobLinesSection
          workOrderId={workOrder.id}
          jobLines={jobLines}
          onJobLinesChange={(updatedJobLines) => {
            // Handle job lines update
            console.log('Job lines updated:', updatedJobLines);
          }}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="activity" className="mt-6">
        <WorkOrderActivityTab workOrderId={workOrder.id} />
      </TabsContent>
    </Tabs>
  );
}
