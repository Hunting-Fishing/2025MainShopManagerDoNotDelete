
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrderOverviewTab } from './WorkOrderOverviewTab';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { WorkOrderTimeTrackingSection } from '../time-tracking/WorkOrderTimeTrackingSection';
import { WorkOrderDocuments } from './WorkOrderDocuments';
import { WorkOrder, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Customer } from '@/types/customer';

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  customer: Customer | null;
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60">
      {/* Header */}
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Work Order #{workOrder.id}
            </h1>
            <p className="text-slate-600 mt-1">
              {workOrder.description || 'No description provided'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isEditMode ? (
              <button
                onClick={onStartEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Work Order
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={onCancelEdit}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onSaveEdit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="px-6 pt-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="joblines">Job Lines</TabsTrigger>
            <TabsTrigger value="parts">Parts</TabsTrigger>
            <TabsTrigger value="time">Time Tracking</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6">
          <TabsContent value="overview" className="mt-0">
            <WorkOrderOverviewTab
              workOrder={workOrder}
              jobLines={jobLines}
              allParts={allParts}
              timeEntries={timeEntries}
              customer={customer}
              onWorkOrderUpdate={onWorkOrderUpdate}
              onPartsChange={onRefreshData}
              isEditMode={isEditMode}
            />
          </TabsContent>
          
          <TabsContent value="joblines" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Job Lines</h3>
              {jobLines.length > 0 ? (
                <div className="space-y-3">
                  {jobLines.map((jobLine) => (
                    <div key={jobLine.id} className="border rounded-lg p-4">
                      <h4 className="font-medium">{jobLine.name}</h4>
                      {jobLine.description && (
                        <p className="text-sm text-muted-foreground mt-1">{jobLine.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm">
                        {jobLine.estimated_hours && (
                          <span>Hours: {jobLine.estimated_hours}</span>
                        )}
                        {jobLine.labor_rate && (
                          <span>Rate: ${jobLine.labor_rate}</span>
                        )}
                        {jobLine.total_amount && (
                          <span>Total: ${jobLine.total_amount}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No job lines added yet.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="parts" className="mt-0">
            <WorkOrderPartsSection
              workOrderId={workOrder.id}
              allParts={allParts}
              jobLines={jobLines}
              onPartsChange={onRefreshData}
              isEditMode={isEditMode}
              showType="overview"
            />
          </TabsContent>
          
          <TabsContent value="time" className="mt-0">
            <WorkOrderTimeTrackingSection
              workOrderId={workOrder.id}
              timeEntries={timeEntries}
              onTimeEntriesChange={onTimeEntriesChange}
              isEditMode={isEditMode}
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
