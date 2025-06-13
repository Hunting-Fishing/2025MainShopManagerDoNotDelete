
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { useJobLines } from '@/hooks/useJobLines';
import { useTechnicians } from '@/hooks/useTechnicians';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workOrderFormSchema, WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { updateWorkOrder } from '@/services/workOrder/workOrderMutationService';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { WorkOrderStatus, WorkOrderPriority } from '@/types/workOrder';

interface WorkOrderDetailsViewProps {
  workOrderId?: string;
}

export function WorkOrderDetailsView({ workOrderId }: WorkOrderDetailsViewProps) {
  const { id } = useParams<{ id: string }>();
  const finalWorkOrderId = workOrderId || id;
  
  const { workOrder, isLoading: workOrderLoading, error: workOrderError } = useWorkOrder(finalWorkOrderId || '');
  const { jobLines, isLoading: jobLinesLoading, setJobLines } = useJobLines(finalWorkOrderId || '');
  const { technicians, isLoading: technicianLoading, error: technicianError } = useTechnicians();
  
  const [activeTab, setActiveTab] = useState('details');
  const [isEditMode, setIsEditMode] = useState(false);

  // Form setup with proper type casting
  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: workOrder?.customer_name || '',
      description: workOrder?.description || '',
      status: (workOrder?.status as WorkOrderStatus) || 'pending',
      priority: (workOrder?.priority as WorkOrderPriority) || 'medium',
      technician: workOrder?.technician || '',
      location: workOrder?.location || '',
      dueDate: workOrder?.due_date || '',
      notes: workOrder?.notes || '',
      vehicleMake: workOrder?.vehicle_make || '',
      vehicleModel: workOrder?.vehicle_model || '',
      vehicleYear: workOrder?.vehicle_year || '',
      odometer: workOrder?.vehicle_odometer || '',
      licensePlate: workOrder?.vehicle_license_plate || '',
      vin: workOrder?.vehicle_vin || '',
      customerEmail: workOrder?.customer_email || '',
      customerPhone: workOrder?.customer_phone || '',
      customerAddress: workOrder?.customer_address || '',
    }
  });

  // Update form when work order data loads
  React.useEffect(() => {
    if (workOrder) {
      form.reset({
        customer: workOrder.customer_name || '',
        description: workOrder.description || '',
        status: (workOrder.status as WorkOrderStatus) || 'pending',
        priority: (workOrder.priority as WorkOrderPriority) || 'medium',
        technician: workOrder.technician || '',
        location: workOrder.location || '',
        dueDate: workOrder.due_date || '',
        notes: workOrder.notes || '',
        vehicleMake: workOrder.vehicle_make || '',
        vehicleModel: workOrder.vehicle_model || '',
        vehicleYear: workOrder.vehicle_year || '',
        odometer: workOrder.vehicle_odometer || '',
        licensePlate: workOrder.vehicle_license_plate || '',
        vin: workOrder.vehicle_vin || '',
        customerEmail: workOrder.customer_email || '',
        customerPhone: workOrder.customer_phone || '',
        customerAddress: workOrder.customer_address || '',
      });
    }
  }, [workOrder, form]);

  const onCreateWorkOrder = async (data: WorkOrderFormSchemaValues) => {
    if (!finalWorkOrderId) return;
    
    try {
      await updateWorkOrder(finalWorkOrderId, data);
      toast.success('Work order updated successfully');
      setActiveTab('details');
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating work order:', error);
      toast.error('Failed to update work order');
    }
  };

  if (workOrderLoading || jobLinesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading work order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (workOrderError || !workOrder) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {workOrderError?.message || 'Work order not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <WorkOrderDetailsTabs
        workOrder={workOrder}
        form={form}
        technicians={technicians}
        technicianLoading={technicianLoading}
        technicianError={technicianError?.message || null}
        jobLines={jobLines}
        onJobLinesChange={setJobLines}
        onCreateWorkOrder={onCreateWorkOrder}
        prePopulatedData={{
          customerId: workOrder.customer_id,
          customerName: workOrder.customer_name,
          customerEmail: workOrder.customer_email,
          customerPhone: workOrder.customer_phone,
          customerAddress: workOrder.customer_address,
          vehicleId: workOrder.vehicle_id,
          vehicleMake: workOrder.vehicle_make,
          vehicleModel: workOrder.vehicle_model,
          vehicleYear: workOrder.vehicle_year,
          vehicleLicensePlate: workOrder.vehicle_license_plate,
          vehicleVin: workOrder.vehicle_vin,
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isEditMode={isEditMode}
      />
    </div>
  );
}
