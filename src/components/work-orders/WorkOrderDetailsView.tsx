
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workOrderFormSchema, WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { useTechnicians } from '@/hooks/useTechnicians';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { useJobLines } from '@/hooks/useJobLines';
import { useWorkOrderEditForm } from '@/hooks/useWorkOrderEditForm';
import { CreateWorkOrderTab } from './details/CreateWorkOrderTab';
import { WorkOrderDetailsTab } from './details/WorkOrderDetailsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [activeTab, setActiveTab] = useState(isCreateMode ? 'edit' : 'details');

  // Fetch work order data
  const { workOrder, isLoading: workOrderLoading, error: workOrderError } = useWorkOrder(workOrderId);
  
  // Fetch job lines for this work order
  const { jobLines, setJobLines, isLoading: jobLinesLoading } = useJobLines(workOrderId);

  // Fetch technicians for the edit form
  const { 
    technicians, 
    isLoading: technicianLoading, 
    error: technicianError 
  } = useTechnicians();

  // Use the edit form hook for updating work order
  const {
    workOrder: editWorkOrder,
    updateField,
    handleSubmit,
    loading: editLoading,
    saving: editSaving,
    error: editError
  } = useWorkOrderEditForm(workOrderId);

  // Form setup for editing
  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      status: workOrder?.status || 'pending',
      priority: workOrder?.priority || 'medium',
      description: workOrder?.description || '',
      customer: workOrder?.customer_name || '',
      customerEmail: workOrder?.customer_email || '',
      customerPhone: workOrder?.customer_phone || '',
      customerAddress: workOrder?.customer_address || '',
      vehicleMake: workOrder?.vehicle_make || '',
      vehicleModel: workOrder?.vehicle_model || '',
      vehicleYear: workOrder?.vehicle_year || '',
      licensePlate: workOrder?.vehicle_license_plate || '',
      vin: workOrder?.vehicle_vin || '',
      technician: workOrder?.technician || '',
      location: workOrder?.location || '',
      dueDate: workOrder?.due_date || '',
      notes: workOrder?.notes || '',
      inventoryItems: [],
    }
  });

  // Update form when work order data loads
  React.useEffect(() => {
    if (workOrder) {
      form.reset({
        status: workOrder.status || 'pending',
        priority: workOrder.priority || 'medium',
        description: workOrder.description || '',
        customer: workOrder.customer_name || '',
        customerEmail: workOrder.customer_email || '',
        customerPhone: workOrder.customer_phone || '',
        customerAddress: workOrder.customer_address || '',
        vehicleMake: workOrder.vehicle_make || '',
        vehicleModel: workOrder.vehicle_model || '',
        vehicleYear: workOrder.vehicle_year || '',
        licensePlate: workOrder.vehicle_license_plate || '',
        vin: workOrder.vehicle_vin || '',
        technician: workOrder.technician || '',
        location: workOrder.location || '',
        dueDate: workOrder.due_date || '',
        notes: workOrder.notes || '',
        inventoryItems: workOrder.inventoryItems || [],
      });
    }
  }, [workOrder, form]);

  const handleJobLinesChange = (newJobLines: any[]) => {
    setJobLines(newJobLines);
  };

  const handleEditSubmit = async (data: WorkOrderFormSchemaValues) => {
    try {
      await handleSubmit();
      // Optionally refresh data or show success message
    } catch (error) {
      console.error('Error updating work order:', error);
    }
  };

  // Loading state
  if (workOrderLoading || jobLinesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg">Loading work order details...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (workOrderError || !workOrder) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {workOrderError?.message || 'Work order not found'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Create mode - should not happen in this view
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
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <WorkOrderDetailsTab
            workOrder={workOrder}
            jobLines={jobLines}
            allParts={[]} // Will be populated by the component internally
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
            prePopulatedCustomer={{
              customerName: workOrder.customer_name,
              customerEmail: workOrder.customer_email,
              customerPhone: workOrder.customer_phone,
              customerAddress: workOrder.customer_address,
              vehicleMake: workOrder.vehicle_make,
              vehicleModel: workOrder.vehicle_model,
              vehicleYear: workOrder.vehicle_year,
              vehicleLicensePlate: workOrder.vehicle_license_plate,
              vehicleVin: workOrder.vehicle_vin,
            }}
            onCreateWorkOrder={handleEditSubmit}
            isEditMode={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
