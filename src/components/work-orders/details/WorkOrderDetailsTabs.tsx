
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Edit3, Save, X } from "lucide-react";
import { WorkOrder } from "@/types/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";
import { WorkOrderPart } from "@/types/workOrderPart";
import { TimeEntry } from "@/types/workOrder";
import { Customer } from "@/types/customer";
import { WorkOrderHeader } from "./WorkOrderHeader";
import { WorkOrderOverviewTab } from "./WorkOrderOverviewTab";
import { WorkOrderPartsSection } from "../parts/WorkOrderPartsSection";
import { WorkOrderJobLinesSection } from "../job-lines/WorkOrderJobLinesSection";
import { WorkOrderTimeTrackingSection } from "../time-tracking/WorkOrderTimeTrackingSection";

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  customer: Customer | null;
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  onTimeEntriesChange: (timeEntries: TimeEntry[]) => void;
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
  const [activeTab, setActiveTab] = useState("overview");

  const handlePartsRefresh = async () => {
    console.log('Parts refresh triggered, refreshing all data...');
    await onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <WorkOrderHeader 
          workOrder={workOrder} 
          customer={customer}
          isEditMode={isEditMode}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onSaveEdit={onSaveEdit}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="joblines">Job Lines</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="timetracking">Time Tracking</TabsTrigger>
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
            onPartsChange={handlePartsRefresh}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="joblines" className="mt-6">
          <WorkOrderJobLinesSection
            workOrderId={workOrder.id}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="parts" className="mt-6">
          <WorkOrderPartsSection
            workOrderId={workOrder.id}
            parts={allParts}
            jobLines={jobLines}
            onPartsChange={handlePartsRefresh}
            isEditMode={isEditMode}
            showType="parts"
          />
        </TabsContent>

        <TabsContent value="timetracking" className="mt-6">
          <WorkOrderTimeTrackingSection
            workOrderId={workOrder.id}
            timeEntries={timeEntries}
            onTimeEntriesChange={onTimeEntriesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <div className="text-center py-8 text-muted-foreground">
            <p>Documents functionality coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
