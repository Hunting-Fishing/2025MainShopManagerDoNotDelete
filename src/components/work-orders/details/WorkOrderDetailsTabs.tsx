
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { WorkOrderDetailsTab } from './WorkOrderDetailsTab';
import { WorkOrderActivityTab } from './WorkOrderActivityTab';
import { WorkOrderDocuments } from './WorkOrderDocuments';
import { WorkOrderInvoiceView } from './WorkOrderInvoiceView';

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  customer: Customer | null;
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  onTimeEntriesChange: (timeEntries: TimeEntry[]) => void;
  onWorkOrderUpdate: (workOrder: WorkOrder) => void;
  isEditMode: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export function WorkOrderDetailsTabs({
  workOrder,
  jobLines,
  allParts,
  timeEntries,
  customer,
  onJobLinesChange,
  onTimeEntriesChange,
  onWorkOrderUpdate,
  isEditMode,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}: WorkOrderDetailsTabsProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="invoice">Invoice</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-6">
          <WorkOrderDetailsTab
            workOrder={workOrder}
            jobLines={jobLines}
            allParts={allParts}
            timeEntries={timeEntries}
            customer={customer}
            onJobLinesChange={onJobLinesChange}
            onTimeEntriesChange={onTimeEntriesChange}
            onWorkOrderUpdate={onWorkOrderUpdate}
            isEditMode={isEditMode}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onSaveEdit={onSaveEdit}
          />
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <WorkOrderActivityTab workOrderId={workOrder.id} />
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-6">
          <WorkOrderDocuments workOrderId={workOrder.id} />
        </TabsContent>
        
        <TabsContent value="invoice" className="space-y-6">
          <WorkOrderInvoiceView 
            workOrder={workOrder}
            jobLines={jobLines}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
