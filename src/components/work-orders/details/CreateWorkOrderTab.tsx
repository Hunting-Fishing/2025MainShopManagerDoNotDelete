
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { WorkOrderFormFields } from '../WorkOrderFormFields';
import { WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { WorkOrderJobLine } from '@/types/jobLine';
import { useToast } from '@/hooks/use-toast';

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

interface CreateWorkOrderTabProps {
  form: UseFormReturn<WorkOrderFormSchemaValues>;
  technicians: Technician[];
  technicianLoading: boolean;
  technicianError: string | null;
  jobLines?: WorkOrderJobLine[];
  onJobLinesChange?: (jobLines: WorkOrderJobLine[]) => void;
  workOrderId?: string;
  shopId?: string;
  prePopulatedCustomer?: {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    equipmentName?: string;
    equipmentType?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    vehicleLicensePlate?: string;
    vehicleVin?: string;
  };
  onCreateWorkOrder?: (data: WorkOrderFormSchemaValues) => void;
  isEditMode?: boolean;
}

export function CreateWorkOrderTab({
  form,
  technicians,
  technicianLoading,
  technicianError,
  jobLines = [],
  onJobLinesChange,
  workOrderId = `temp-${Date.now()}`,
  shopId,
  prePopulatedCustomer,
  onCreateWorkOrder,
  isEditMode = false
}: CreateWorkOrderTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data: WorkOrderFormSchemaValues) => {
    console.log('=== CREATE WORK ORDER TAB SUBMIT ===');
    console.log('1. Form data received:', data);
    
    // Check if handler is provided
    if (!onCreateWorkOrder) {
      console.error('onCreateWorkOrder handler not provided');
      toast({
        title: "Configuration Error",
        description: "Work order creation handler is not configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    const errors = [];
    if (!data.customer || data.customer.trim() === '') {
      errors.push("Customer name is required");
    }
    if (!data.description || data.description.trim() === '') {
      errors.push("Description is required");
    }

    if (errors.length > 0) {
      console.log('2. Validation errors found:', errors);
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }
    
    console.log('2. Validation passed, starting submission...');
    setIsSubmitting(true);
    try {
      // Ensure inventoryItems is properly typed
      const formData: WorkOrderFormSchemaValues = {
        ...data,
        inventoryItems: Array.isArray(data.inventoryItems) ? data.inventoryItems : []
      };
      
      console.log('3. Final form data being passed to handler:', formData);
      await onCreateWorkOrder(formData);
      
      console.log('4. Work order creation completed successfully');
      toast({
        title: "Success",
        description: `Work order ${isEditMode ? 'updated' : 'created'} successfully`,
        variant: "default",
      });
    } catch (error) {
      console.error('=== CREATE WORK ORDER TAB ERROR ===');
      console.error('Error in onSubmit:', error);
      console.error('Error message:', (error as Error)?.message);
      
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'create'} work order: ${(error as Error)?.message}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? 'Edit Work Order' : 'Create New Work Order'}
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
                onJobLinesChange={onJobLinesChange}
                workOrderId={workOrderId}
                shopId={shopId}
                prePopulatedCustomer={prePopulatedCustomer}
              />
              
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? (isEditMode ? 'Updating...' : 'Creating...') 
                    : (isEditMode ? 'Update Work Order' : 'Create Work Order')
                  }
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
