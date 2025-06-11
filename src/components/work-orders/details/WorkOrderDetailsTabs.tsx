
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";
import { WorkOrderPart } from "@/types/workOrderPart";
import { WorkOrderInventorySection } from "../inventory/WorkOrderInventorySection";
import { TimeTrackingSection } from "../time-tracking/TimeTrackingSection";
import { WorkOrderCommunications } from "../communications/WorkOrderCommunications";
import { WorkOrderPartsSection } from "../parts/WorkOrderPartsSection";
import { WorkOrderLaborSection } from "../labor/WorkOrderLaborSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
  inventoryItems: WorkOrderInventoryItem[];
  notes: string;
  onUpdateNotes: (notes: string) => void;
  jobLines: WorkOrderJobLine[];
  parts: WorkOrderPart[];
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
  parts,
  onJobLinesChange,
  jobLinesLoading,
  isEditMode = false
}: WorkOrderDetailsTabsProps) {
  const handleUpdateTimeEntries = (entries: any) => {
    console.log('Time entries updated:', entries);
    onUpdateTimeEntries(entries);
  };

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="parts">Parts</TabsTrigger>
        <TabsTrigger value="labor">Labor</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="time">Time Tracking</TabsTrigger>
        <TabsTrigger value="communications">Communications</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Service Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Service Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-md">
                  {workOrder.description || 'No description provided'}
                </p>
              </div>

              {/* Work Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Job Lines</p>
                  <p className="text-2xl font-bold text-blue-900">{jobLines.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Parts</p>
                  <p className="text-2xl font-bold text-green-900">{parts.length}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium">Time Entries</p>
                  <p className="text-2xl font-bold text-orange-900">{timeEntries.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Status</p>
                  <p className="text-lg font-bold text-purple-900 capitalize">{workOrder.status}</p>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Service Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Type:</span>
                      <span className="font-medium">{workOrder.service_type || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Hours:</span>
                      <span className="font-medium">{workOrder.estimated_hours || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="font-medium">${workOrder.total_cost || '0.00'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Assignment</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Advisor:</span>
                      <span className="font-medium">{workOrder.advisor_id || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Technician:</span>
                      <span className="font-medium">{workOrder.technician || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{new Date(workOrder.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="parts" className="mt-6">
        <WorkOrderPartsSection
          workOrderId={workOrder.id}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="labor" className="mt-6">
        <WorkOrderLaborSection
          workOrderId={workOrder.id}
          jobLines={jobLines}
          onJobLinesChange={onJobLinesChange}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="inventory" className="mt-6">
        <WorkOrderInventorySection
          workOrderId={workOrder.id}
          inventoryItems={inventoryItems}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="time" className="mt-6">
        <TimeTrackingSection
          workOrderId={workOrder.id}
          timeEntries={timeEntries}
          onUpdateTimeEntries={handleUpdateTimeEntries}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="communications" className="mt-6">
        <WorkOrderCommunications workOrder={workOrder} />
      </TabsContent>
    </Tabs>
  );
}
