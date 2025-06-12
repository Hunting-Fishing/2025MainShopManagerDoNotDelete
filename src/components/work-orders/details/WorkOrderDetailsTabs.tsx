
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateWorkOrderTab } from './CreateWorkOrderTab';
import { WorkOrderDetailsTab } from './WorkOrderDetailsTab';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrder } from '@/types/workOrder';

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
  onJobLinesChange?: (jobLines: WorkOrderJobLine[]) => void;
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
  onJobLinesChange,
  onCreateWorkOrder,
  prePopulatedData,
  activeTab,
  setActiveTab,
  isEditMode = false
}: WorkOrderDetailsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="edit">Edit</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <WorkOrderDetailsTab
          workOrder={workOrder}
          jobLines={jobLines}
          allParts={[]}
          onJobLinesChange={onJobLinesChange}
          isEditMode={false}
        />
      </TabsContent>

      <TabsContent value="edit">
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
      </TabsContent>
    </Tabs>
  );
}
