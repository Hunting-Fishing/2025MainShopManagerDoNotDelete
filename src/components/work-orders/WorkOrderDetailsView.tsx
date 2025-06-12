
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workOrderFormSchema, WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { useTechnicians } from '@/hooks/useTechnicians';
import { useWorkOrderPrePopulation } from '@/hooks/useWorkOrderPrePopulation';
import { CreateWorkOrderTab } from './details/CreateWorkOrderTab';
import { WorkOrderDetailsTab } from './details/WorkOrderDetailsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WorkOrderDetailsViewProps {
  workOrderId: string;
  isCreateMode?: boolean;
  prePopulatedData?: Record<string, any>;
  onCreateWorkOrder?: (data: WorkOrderFormSchemaValues) => void;
}

export function WorkOrderDetailsView({
  workOrderId,
  isCreateMode = false,
  prePopulatedData = {},
  onCreateWorkOrder
}: WorkOrderDetailsViewProps) {
  const [activeTab, setActiveTab] = useState(isCreateMode ? 'create' : 'details');
  const [isEditMode, setIsEditMode] = useState(isCreateMode);
  const [jobLines, setJobLines] = useState([]);
  const [allParts, setAllParts] = useState([]);

  // Fetch technicians
  const { 
    technicians, 
    isLoading: technicianLoading, 
    error: technicianError 
  } = useTechnicians();

  // Pre-populate data handling
  const {
    selectedCustomer,
    selectedVehicle,
    loading: prePopulationLoading,
    error: prePopulationError,
    getInitialFormData
  } = useWorkOrderPrePopulation(prePopulatedData);

  // Form setup
  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      status: 'pending',
      priority: 'medium',
      inventoryItems: [],
      ...getInitialFormData()
    }
  });

  // Update form when pre-populated data changes
  useEffect(() => {
    if (!prePopulationLoading && (selectedCustomer || prePopulatedData)) {
      const initialData = getInitialFormData();
      Object.keys(initialData).forEach(key => {
        form.setValue(key as keyof WorkOrderFormSchemaValues, initialData[key]);
      });
    }
  }, [selectedCustomer, selectedVehicle, prePopulationLoading, form, getInitialFormData]);

  const handleJobLinesChange = (newJobLines: any[]) => {
    setJobLines(newJobLines);
  };

  if (isCreateMode) {
    return (
      <CreateWorkOrderTab
        form={form}
        technicians={technicians}
        technicianLoading={technicianLoading}
        technicianError={technicianError || null}
        jobLines={jobLines}
        onJobLinesChange={handleJobLinesChange}
        workOrderId={workOrderId}
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
      />
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="edit">Edit</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <WorkOrderDetailsTab
          workOrder={{} as any} // This would be loaded from the actual work order
          jobLines={jobLines}
          allParts={allParts}
          onJobLinesChange={handleJobLinesChange}
          isEditMode={false}
        />
      </TabsContent>

      <TabsContent value="edit">
        <CreateWorkOrderTab
          form={form}
          technicians={technicians}
          technicianLoading={technicianLoading}
          technicianError={technicianError || null}
          jobLines={jobLines}
          onJobLinesChange={handleJobLinesChange}
          workOrderId={workOrderId}
          isEditMode={true}
        />
      </TabsContent>
    </Tabs>
  );
}
