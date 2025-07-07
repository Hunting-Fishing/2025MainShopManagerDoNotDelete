
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WorkOrderFormFields } from '../WorkOrderFormFields';
import { WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { WorkOrderJobLine } from '@/types/jobLine';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle } from 'lucide-react';

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
    console.log('2. Form errors state:', form.formState.errors);
    console.log('3. Form is valid:', form.formState.isValid);
    
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
    
    console.log('4. Validation passed, starting submission...');
    setIsSubmitting(true);
    try {
      // Ensure inventoryItems is properly typed
      const formData: WorkOrderFormSchemaValues = {
        ...data,
        inventoryItems: Array.isArray(data.inventoryItems) ? data.inventoryItems : []
      };
      
      console.log('5. Final form data being passed to handler:', formData);
      await onCreateWorkOrder(formData);
      
      console.log('6. Work order creation completed successfully');
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

  // Get form validation errors for display
  const getFormErrors = () => {
    const errors: string[] = [];
    if (form.formState.errors.customer) {
      errors.push("Customer name is required");
    }
    if (form.formState.errors.description) {
      errors.push("Description is required");
    }
    return errors;
  };

  const formErrors = getFormErrors();
  const hasFormErrors = formErrors.length > 0;
  const isFormValid = form.formState.isValid;

  // Debug logging for form state
  console.log('=== FORM STATE DEBUG ===');
  console.log('Form is valid:', isFormValid);
  console.log('Form errors:', form.formState.errors);
  console.log('Form values:', form.getValues());
  console.log('Has form errors:', hasFormErrors);
  console.log('Form errors list:', formErrors);

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
              
              {/* Form Validation Feedback */}
              {hasFormErrors && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-1">Please fix the following errors:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {formErrors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Form Success Indicator */}
              {isFormValid && !hasFormErrors && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Form is ready to submit!
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || hasFormErrors}
                  className={hasFormErrors ? "opacity-50 cursor-not-allowed" : ""}
                >
                  {isSubmitting 
                    ? (isEditMode ? 'Updating...' : 'Creating...') 
                    : hasFormErrors 
                      ? 'Fix errors to continue'
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
