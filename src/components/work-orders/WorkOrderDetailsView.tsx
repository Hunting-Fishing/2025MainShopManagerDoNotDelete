
import React, { useState } from "react";
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from "@/types/workOrder";
import { WorkOrderPageLayout } from "./WorkOrderPageLayout";
import { WorkOrderDetailsHeader } from "./details/WorkOrderDetailsHeader";
import { WorkOrderDetailsTabs } from "./details/WorkOrderDetailsTabs";
import { WorkOrderInvoiceView } from "./WorkOrderInvoiceView";
import { Button } from "@/components/ui/button";
import { FileText, Layout } from "lucide-react";

export interface WorkOrderDetailsViewProps {
  workOrder: WorkOrder;
}

export function WorkOrderDetailsView({ workOrder }: WorkOrderDetailsViewProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(workOrder?.timeEntries || []);
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);
  const [notes, setNotes] = useState<string>(workOrder?.notes || '');
  const [viewMode, setViewMode] = useState<'details' | 'invoice'>('details');

  if (!workOrder) {
    return null;
  }
  
  // Handler for updating time entries
  const handleUpdateTimeEntries = (entries: TimeEntry[]) => {
    setTimeEntries(entries);
  };
  
  // Handler for updating notes
  const handleUpdateNotes = (updatedNotes: string) => {
    setNotes(updatedNotes);
  };

  return (
    <WorkOrderPageLayout
      title={`Work Order: ${workOrder.id}`}
      description={workOrder.description || "No description provided"}
      backLink="/work-orders"
      backLinkText="Back to Work Orders"
    >
      <div className="space-y-6">
        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Work Order Details</h1>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'details' ? 'default' : 'outline'}
              onClick={() => setViewMode('details')}
              className="flex items-center gap-2"
            >
              <Layout className="h-4 w-4" />
              Details View
            </Button>
            <Button
              variant={viewMode === 'invoice' ? 'default' : 'outline'}
              onClick={() => setViewMode('invoice')}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Invoice View
            </Button>
          </div>
        </div>

        {viewMode === 'details' ? (
          <>
            <WorkOrderDetailsHeader workOrder={workOrder} />
            <WorkOrderDetailsTabs 
              workOrder={workOrder}
              timeEntries={timeEntries}
              inventoryItems={inventoryItems}
              notes={notes}
              onUpdateNotes={handleUpdateNotes}
              onUpdateTimeEntries={handleUpdateTimeEntries}
            />
          </>
        ) : (
          <WorkOrderInvoiceView workOrder={workOrder} />
        )}
      </div>
    </WorkOrderPageLayout>
  );
}
