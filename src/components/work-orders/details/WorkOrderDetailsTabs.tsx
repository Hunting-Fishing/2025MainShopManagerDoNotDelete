
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateWorkOrderTab } from './CreateWorkOrderTab';
import { WorkOrderDetailsTab } from './WorkOrderDetailsTab';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { TimeTrackingSection } from '../time-tracking/TimeTrackingSection';
import { WorkOrderDocuments } from './WorkOrderDocuments';
import { WorkOrderCommunications } from '../communications/WorkOrderCommunications';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrder } from '@/types/workOrder';
import { TimeEntry } from '@/types/workOrder';

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

interface PrePopulatedData {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerZip?: string;
  vehicleId?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleLicensePlate?: string;
  vehicleVin?: string;
}

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  form: UseFormReturn<WorkOrderFormSchemaValues>;
  technicians: Technician[];
  technicianLoading: boolean;
  technicianError: string | null;
  jobLines?: WorkOrderJobLine[];
  timeEntries?: TimeEntry[];
  onJobLinesChange?: (jobLines: WorkOrderJobLine[]) => void;
  onUpdateTimeEntries?: (entries: TimeEntry[]) => void;
  onCreateWorkOrder: (data: WorkOrderFormSchemaValues) => Promise<void>;
  prePopulatedData: PrePopulatedData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isEditMode?: boolean;
}

export function WorkOrderDetailsTabs({
  workOrder,
  form,
  technicians,
  technicianLoading,
  technicianError,
  jobLines = [],
  timeEntries = [],
  onJobLinesChange,
  onUpdateTimeEntries,
  onCreateWorkOrder,
  prePopulatedData,
  activeTab,
  setActiveTab,
  isEditMode = false
}: WorkOrderDetailsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="parts">Parts & Inventory</TabsTrigger>
        <TabsTrigger value="time">Time Tracking</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="communications">Communications</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        {isEditMode ? (
          <CreateWorkOrderTab
            form={form}
            technicians={technicians}
            technicianLoading={technicianLoading}
            technicianError={technicianError}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
            workOrderId={workOrder.id}
            shopId={workOrder.customer_id}
            prePopulatedCustomer={{
              customerName: prePopulatedData.customerName,
              customerEmail: prePopulatedData.customerEmail,
              customerPhone: prePopulatedData.customerPhone,
              customerAddress: prePopulatedData.customerAddress,
              vehicleMake: prePopulatedData.vehicleMake,
              vehicleModel: prePopulatedData.vehicleModel,
              vehicleYear: prePopulatedData.vehicleYear,
              vehicleLicensePlate: prePopulatedData.vehicleLicensePlate,
              vehicleVin: prePopulatedData.vehicleVin,
            }}
            onCreateWorkOrder={onCreateWorkOrder}
            isEditMode={isEditMode}
          />
        ) : (
          <WorkOrderDetailsTab
            workOrder={workOrder}
            jobLines={jobLines}
            allParts={[]}
            onJobLinesChange={onJobLinesChange}
            isEditMode={false}
          />
        )}
      </TabsContent>

      <TabsContent value="parts">
        <WorkOrderPartsSection
          workOrderId={workOrder.id}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="time">
        <TimeTrackingSection
          workOrderId={workOrder.id}
          timeEntries={timeEntries}
          onUpdateTimeEntries={onUpdateTimeEntries || (() => {})}
          isEditMode={isEditMode}
        />
      </TabsContent>

      <TabsContent value="documents">
        <WorkOrderDocuments workOrderId={workOrder.id} />
      </TabsContent>

      <TabsContent value="communications">
        <WorkOrderCommunications workOrder={workOrder} />
      </TabsContent>
    </Tabs>
  );
}
