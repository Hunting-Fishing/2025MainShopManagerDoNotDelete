
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrderOverviewTab } from './WorkOrderOverviewTab';
import { WorkOrderJobLinesSection } from '../job-lines/WorkOrderJobLinesSection';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { WorkOrderTimeTrackingSection } from '../time-tracking/WorkOrderTimeTrackingSection';
import { WorkOrderDocuments } from '../documents/WorkOrderDocuments';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  customer: any;
  onJobLinesChange: () => Promise<void>;
  onTimeEntriesChange: () => Promise<void>;
  onWorkOrderUpdate: (workOrder: WorkOrder) => void;
  onRefreshData: () => Promise<void>;
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
  onRefreshData,
  isEditMode,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}: WorkOrderDetailsTabsProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 overflow-hidden">
      <Tabs defaultValue="overview" className="w-full">
        <div className="bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30 border-b border-slate-200/60">
          <TabsList className="w-full justify-start bg-transparent h-auto p-0 space-x-0">
            <TabsTrigger 
              value="overview" 
              className="px-8 py-4 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="job-lines" 
              className="px-8 py-4 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200"
            >
              Job Lines
            </TabsTrigger>
            <TabsTrigger 
              value="parts" 
              className="px-8 py-4 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200"
            >
              Parts
            </TabsTrigger>
            <TabsTrigger 
              value="time-tracking" 
              className="px-8 py-4 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200"
            >
              Time Tracking
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="px-8 py-4 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700 text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 transition-all duration-200"
            >
              Documents
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="p-8">
          <TabsContent value="overview" className="mt-0">
            <WorkOrderOverviewTab
              workOrder={workOrder}
              customer={customer}
              jobLines={jobLines}
              allParts={allParts}
              timeEntries={timeEntries}
              onWorkOrderUpdate={onWorkOrderUpdate}
              onRefreshData={onRefreshData}
              isEditMode={isEditMode}
              onStartEdit={onStartEdit}
              onCancelEdit={onCancelEdit}
              onSaveEdit={onSaveEdit}
            />
          </TabsContent>
          
          <TabsContent value="job-lines" className="mt-0">
            <WorkOrderJobLinesSection
              workOrderId={workOrder.id}
              jobLines={jobLines}
              onJobLinesChange={onJobLinesChange}
              isEditMode={isEditMode}
            />
          </TabsContent>
          
          <TabsContent value="parts" className="mt-0">
            <WorkOrderPartsSection
              workOrderId={workOrder.id}
              parts={allParts}
              viewMode="overview"
              onRefresh={onRefreshData}
            />
          </TabsContent>
          
          <TabsContent value="time-tracking" className="mt-0">
            <WorkOrderTimeTrackingSection
              workOrderId={workOrder.id}
              timeEntries={timeEntries}
              onRefresh={onTimeEntriesChange}
            />
          </TabsContent>
          
          <TabsContent value="documents" className="mt-0">
            <WorkOrderDocuments
              workOrderId={workOrder.id}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
