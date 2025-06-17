
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
import { WorkOrderTotals } from '../shared/WorkOrderTotals';
import { WorkOrderDocuments } from './WorkOrderDocuments';
import { WorkOrderNotes } from './WorkOrderNotes';
import { WorkOrderActivityHistory } from './WorkOrderActivityHistory';

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
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <WorkOrderHeader
        workOrder={workOrder}
        customer={customer}
        isEditMode={isEditMode}
        onStartEdit={onStartEdit}
        onCancelEdit={onCancelEdit}
        onSaveEdit={onSaveEdit}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Customer and Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WorkOrderCustomerInfo customer={customer} workOrder={workOrder} />
                <WorkOrderVehicleInfo workOrder={workOrder} />
              </div>

              {/* Job Lines Preview */}
              <JobLinesSection
                workOrderId={workOrder.id}
                jobLines={jobLines}
                onJobLinesChange={onJobLinesChange}
                isEditMode={isEditMode}
                showType="joblines"
              />

              {/* Parts Preview */}
              <WorkOrderPartsSection
                workOrderId={workOrder.id}
                allParts={allParts}
                jobLines={jobLines}
                onPartsChange={() => {}}
                isEditMode={isEditMode}
                showType="parts"
              />
            </div>

            {/* Totals Sidebar */}
            <div>
              <WorkOrderTotals jobLines={jobLines} allParts={allParts} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <JobLinesSection
            workOrderId={workOrder.id}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
            isEditMode={isEditMode}
            showType="all"
          />
        </TabsContent>

        <TabsContent value="parts" className="space-y-6">
          <WorkOrderPartsSection
            workOrderId={workOrder.id}
            allParts={allParts}
            jobLines={jobLines}
            onPartsChange={() => {}}
            isEditMode={isEditMode}
            showType="all"
          />
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <TimeTrackingSection
            workOrderId={workOrder.id}
            timeEntries={timeEntries}
            onUpdateTimeEntries={onTimeEntriesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <WorkOrderDocuments workOrderId={workOrder.id} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <WorkOrderActivityHistory workOrderId={workOrder.id} />
          <WorkOrderNotes workOrderId={workOrder.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
