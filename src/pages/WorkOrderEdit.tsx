
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useWorkOrderEditForm } from '@/hooks/useWorkOrderEditForm';
import { useTechnicians } from '@/hooks/useTechnicians';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { workOrderFormSchema, WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { EditFormHeader } from '@/components/work-orders/edit/EditFormHeader';
import { WorkOrderEditFormContent } from '@/components/work-orders/edit/WorkOrderEditFormContent';
import { toast } from '@/hooks/use-toast';

const WorkOrderEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    workOrder,
    updateField,
    handleSubmit,
    loading,
    saving,
    error,
  } = useWorkOrderEditForm(id!);

  const { technicians, loading: technicianLoading, error: technicianError } = useTechnicians();

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: workOrder.customer_name || '',
      description: workOrder.description || '',
      status: (workOrder.status as any) || 'pending',
      priority: 'medium',
      technician: workOrder.technician_id || '',
      location: '',
      dueDate: '',
      notes: workOrder.notes || '',
      vehicleMake: workOrder.vehicle_make || '',
      vehicleModel: workOrder.vehicle_model || '',
      vehicleYear: workOrder.vehicle_year?.toString() || '',
      odometer: '',
      licensePlate: workOrder.vehicle_license_plate || '',
      vin: workOrder.vehicle_vin || '',
      inventoryItems: workOrder.inventoryItems || [],
    }
  });

  // Update form when workOrder data loads
  React.useEffect(() => {
    if (workOrder && Object.keys(workOrder).length > 0) {
      form.reset({
        customer: workOrder.customer_name || '',
        description: workOrder.description || '',
        status: (workOrder.status as any) || 'pending',
        priority: 'medium',
        technician: workOrder.technician_id || '',
        location: '',
        dueDate: '',
        notes: workOrder.notes || '',
        vehicleMake: workOrder.vehicle_make || '',
        vehicleModel: workOrder.vehicle_model || '',
        vehicleYear: workOrder.vehicle_year?.toString() || '',
        odometer: '',
        licensePlate: workOrder.vehicle_license_plate || '',
        vin: workOrder.vehicle_vin || '',
        inventoryItems: workOrder.inventoryItems || [],
      });
    }
  }, [workOrder, form]);

  const onSubmit = async (values: WorkOrderFormSchemaValues) => {
    try {
      // Map form values to work order fields
      const updatedWorkOrder = {
        ...workOrder,
        description: values.description,
        status: values.status,
        technician_id: values.technician,
        notes: values.notes,
        vehicle_make: values.vehicleMake,
        vehicle_model: values.vehicleModel,
        vehicle_year: values.vehicleYear ? parseInt(values.vehicleYear) : undefined,
        vehicle_license_plate: values.licensePlate,
        vehicle_vin: values.vin,
      };

      // Update each field
      Object.entries(updatedWorkOrder).forEach(([key, value]) => {
        if (key !== 'id') {
          updateField(key as keyof typeof workOrder, value);
        }
      });

      // Submit the changes
      const result = await handleSubmit();
      
      if (result) {
        toast({
          title: "Success",
          description: "Work order updated successfully"
        });
        navigate(`/work-orders/${id}`);
      }
    } catch (err) {
      console.error('Error updating work order:', err);
      toast({
        title: "Error",
        description: "Failed to update work order",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading work order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Work order not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <EditFormHeader workOrderId={id!} />
      
      <WorkOrderEditFormContent
        workOrderId={id!}
        technicians={technicians}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={saving}
        error={error}
      />
    </div>
  );
};

export default WorkOrderEdit;
