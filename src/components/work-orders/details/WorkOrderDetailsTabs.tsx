
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { WorkOrderDetailsTab } from './WorkOrderDetailsTab';
import { WorkOrderActivityTab } from './WorkOrderActivityTab';
import { WorkOrderDocuments } from './WorkOrderDocuments';
import { Button } from '@/components/ui/button';
import { Edit3, Save, X } from 'lucide-react';
import { ConvertToInvoiceButton } from '../ConvertToInvoiceButton';

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
  const [activeTab, setActiveTab] = useState('details');

  const handleInvoiceSuccess = (invoiceId: string) => {
    console.log('Invoice created successfully:', invoiceId);
    // You could redirect to the invoice or show a success message
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Work Order Details</h1>
          <p className="text-muted-foreground">
            {workOrder.work_order_number || `#${workOrder.id}`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <ConvertToInvoiceButton
            workOrderId={workOrder.id}
            workOrderStatus={workOrder.status}
            onSuccess={handleInvoiceSuccess}
          />
          
          {!isEditMode ? (
            <Button onClick={onStartEdit} size="sm">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={onSaveEdit} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button onClick={onCancelEdit} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
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

        <TabsContent value="activity" className="mt-6">
          <WorkOrderActivityTab workOrderId={workOrder.id} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <WorkOrderDocuments workOrderId={workOrder.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
