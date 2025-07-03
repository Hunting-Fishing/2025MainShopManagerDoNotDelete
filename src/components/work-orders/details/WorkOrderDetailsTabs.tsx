
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
import { WorkOrderNotifications } from '../notifications/WorkOrderNotifications';
import { WorkOrderDocuments } from '../documents/WorkOrderDocuments';

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  customer: Customer | null;
  onWorkOrderUpdate: () => Promise<void>;
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

  const handleJobLinesChange = async () => {
    await onWorkOrderUpdate();
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-6 max-w-4xl">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="parts">Parts</TabsTrigger>
        <TabsTrigger value="labor">Labor</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
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
          jobLines={jobLines}
          onPartsChange={onPartsChange}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="labor" className="mt-6">
        <JobLinesSection
          workOrderId={workOrder.id}
          jobLines={jobLines}
          onJobLinesChange={handleJobLinesChange}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="activity" className="mt-6">
        <WorkOrderActivityTab workOrderId={workOrder.id} />
      </TabsContent>

      <TabsContent value="notifications" className="mt-6">
        <WorkOrderNotifications workOrderId={workOrder.id} />
      </TabsContent>

      <TabsContent value="documents" className="mt-6">
        <WorkOrderDocuments 
          workOrderId={workOrder.id} 
          isEditMode={isEditMode} 
        />
      </TabsContent>
    </Tabs>
  );
}
