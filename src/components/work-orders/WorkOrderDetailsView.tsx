
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderFormFields } from './WorkOrderFormFields';
import { WorkOrderFormSchemaValues, workOrderFormSchema } from '@/schemas/workOrderSchema';
import { useWorkOrderPrePopulation } from '@/hooks/useWorkOrderPrePopulation';
import { useTechnicians } from '@/hooks/useTechnicians';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Loader2 } from 'lucide-react';

interface WorkOrderDetailsViewProps {
  workOrderId?: string;
  isCreateMode?: boolean;
  prePopulatedData?: any;
  onCreateWorkOrder?: (data: any) => void;
}

export function WorkOrderDetailsView({
  workOrderId,
  isCreateMode = false,
  prePopulatedData = {},
  onCreateWorkOrder
}: WorkOrderDetailsViewProps) {
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use the pre-population hook
  const {
    selectedCustomer,
    selectedVehicle,
    loading: customerLoading,
    error: customerError,
    getInitialFormData
  } = useWorkOrderPrePopulation(prePopulatedData);

  // Get technicians
  const {
    technicians,
    loading: technicianLoading,
    error: technicianError
  } = useTechnicians();

  // Set up form with proper defaults
  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      technician: '',
      location: '',
      dueDate: '',
      notes: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      odometer: '',
      licensePlate: '',
      vin: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      inventoryItems: [],
    }
  });

  // Update form when customer data is loaded
  useEffect(() => {
    if (!customerLoading) {
      const initialData = getInitialFormData();
      console.log('Setting form values with:', initialData);
      
      // Reset form with new values
      form.reset(initialData);
    }
  }, [customerLoading, selectedCustomer, selectedVehicle, form, getInitialFormData]);

  const onSubmit = async (data: WorkOrderFormSchemaValues) => {
    if (!onCreateWorkOrder) return;
    
    setIsSubmitting(true);
    try {
      console.log('Submitting work order with data:', data);
      
      // Prepare work order data with customer and vehicle IDs if available
      const workOrderData = {
        ...data,
        customer_id: selectedCustomer?.id,
        vehicle_id: selectedVehicle?.id,
        jobLines,
      };
      
      await onCreateWorkOrder(workOrderData);
    } catch (error) {
      console.error('Error creating work order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (customerLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading customer information...</span>
      </div>
    );
  }

  if (customerError) {
    console.error('Customer loading error:', customerError);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isCreateMode ? 'Create New Work Order' : 'Work Order Details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <WorkOrderFormFields
                form={form}
                technicians={technicians}
                technicianLoading={technicianLoading}
                technicianError={technicianError}
                jobLines={jobLines}
                onJobLinesChange={setJobLines}
                workOrderId={workOrderId}
                prePopulatedCustomer={{
                  customerName: form.getValues('customer'),
                  customerEmail: form.getValues('customerEmail'),
                  customerPhone: form.getValues('customerPhone'),
                  customerAddress: form.getValues('customerAddress'),
                  vehicleMake: form.getValues('vehicleMake'),
                  vehicleModel: form.getValues('vehicleModel'),
                  vehicleYear: form.getValues('vehicleYear'),
                  vehicleLicensePlate: form.getValues('licensePlate'),
                  vehicleVin: form.getValues('vin'),
                }}
              />

              {isCreateMode && (
                <div className="flex justify-end space-x-4">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Work Order'
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
