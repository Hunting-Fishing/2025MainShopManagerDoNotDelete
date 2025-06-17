
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { WorkOrderHeader } from './WorkOrderHeader';
import { WorkOrderCustomerInfo } from './WorkOrderCustomerInfo';
import { WorkOrderVehicleInfo } from './WorkOrderVehicleInfo';
import { JobLinesSection } from '../form-fields/JobLinesSection';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { TimeTrackingSection } from '../time-tracking/TimeTrackingSection';
import { WorkOrderNotes } from './WorkOrderNotes';
import { WorkOrderTotals } from '../shared/WorkOrderTotals';

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  customer: Customer | null;
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  onTimeEntriesChange: (entries: TimeEntry[]) => void;
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
  const handleNotesUpdate = (notes: string) => {
    onWorkOrderUpdate({
      ...workOrder,
      notes
    });
  };

  return (
    <div className="space-y-6">
      <WorkOrderHeader
        workOrder={workOrder}
        customer={customer}
        isEditMode={isEditMode}
        onStartEdit={onStartEdit}
        onCancelEdit={onCancelEdit}
        onSaveEdit={onSaveEdit}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkOrderCustomerInfo
          customer={customer}
          workOrder={workOrder}
        />
        <WorkOrderVehicleInfo
          workOrder={workOrder}
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">Overview</TabsTrigger>
          <TabsTrigger value="labor">Labor</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <JobLinesSection
                workOrderId={workOrder.id}
                jobLines={jobLines}
                onJobLinesChange={onJobLinesChange}
                isEditMode={isEditMode}
                showType="all"
              />
              
              <WorkOrderPartsSection
                workOrderId={workOrder.id}
                allParts={allParts}
                jobLines={jobLines}
                onPartsChange={() => {}}
                isEditMode={isEditMode}
                showType="all"
              />
              
              <TimeTrackingSection
                workOrderId={workOrder.id}
                timeEntries={timeEntries}
                onUpdateTimeEntries={onTimeEntriesChange}
                isEditMode={isEditMode}
              />
            </div>
            
            <div>
              <WorkOrderTotals
                jobLines={jobLines}
                allParts={allParts}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="labor">
          <JobLinesSection
            workOrderId={workOrder.id}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
            isEditMode={isEditMode}
            showType="joblines"
          />
        </TabsContent>

        <TabsContent value="parts">
          <WorkOrderPartsSection
            workOrderId={workOrder.id}
            allParts={allParts}
            jobLines={jobLines}
            onPartsChange={() => {}}
            isEditMode={isEditMode}
            showType="parts"
          />
        </TabsContent>

        <TabsContent value="time">
          <TimeTrackingSection
            workOrderId={workOrder.id}
            timeEntries={timeEntries}
            onUpdateTimeEntries={onTimeEntriesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="notes">
          <WorkOrderNotes
            workOrderId={workOrder.id}
            notes={workOrder.notes || ''}
            onUpdateNotes={handleNotesUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
