
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { BasicPartFields } from './BasicPartFields';
import { PartTypeAndStatusFields } from './PartTypeAndStatusFields';
import { JobLineSelector } from './JobLineSelector';
import { createWorkOrderPart } from '@/services/workOrder';
import { PartsFormValidator } from '@/utils/partsErrorHandler';
import { Loader2 } from 'lucide-react';

const addPartSchema = z.object({
  name: z.string().min(1, 'Part name is required'),
  part_number: z.string().min(1, 'Part number is required'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  status: z.string().default('pending'),
  notes: z.string().optional(),
  job_line_id: z.string().optional(),
  category: z.string().optional(),
  part_type: z.string().min(1, 'Part type is required'),
  
  // Optional extended fields
  customerPrice: z.number().optional(),
  supplierCost: z.number().optional(),
  retailPrice: z.number().optional(),
  markupPercentage: z.number().optional(),
  isTaxable: z.boolean().optional(),
  coreChargeAmount: z.number().optional(),
  coreChargeApplied: z.boolean().optional(),
  warrantyDuration: z.string().optional(),
  warrantyExpiryDate: z.string().optional(),
  installDate: z.string().optional(),
  installedBy: z.string().optional(),
  invoiceNumber: z.string().optional(),
  poLine: z.string().optional(),
  isStockItem: z.boolean().optional(),
  supplierName: z.string().optional(),
  supplierOrderRef: z.string().optional(),
  notesInternal: z.string().optional(),
  inventoryItemId: z.string().optional(),
  estimatedArrivalDate: z.string().optional(),
  itemStatus: z.string().optional()
});

interface AddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onPartAdded: () => Promise<void>;
}

export function AddPartDialog({
  open,
  onOpenChange,
  workOrderId,
  jobLines,
  onPartAdded
}: AddPartDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkOrderPartFormValues>({
    resolver: zodResolver(addPartSchema),
    defaultValues: {
      name: '',
      part_number: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      status: 'pending',
      notes: '',
      part_type: 'inventory',
      job_line_id: '',
      category: '',
      isTaxable: false,
      coreChargeApplied: false,
      isStockItem: false
    }
  });

  const handleSubmit = async (data: WorkOrderPartFormValues) => {
    console.log('AddPartDialog: Starting submission with data:', data);
    
    try {
      setIsSubmitting(true);

      // Validate the form data
      const validationErrors = PartsFormValidator.validatePartForm(data);
      if (validationErrors.length > 0) {
        PartsFormValidator.showValidationErrors(validationErrors);
        return;
      }

      // Prepare data for API
      const apiData = PartsFormValidator.preparePartDataForApi(data);
      console.log('AddPartDialog: Prepared API data:', apiData);

      // Create the part
      const newPart = await createWorkOrderPart(workOrderId, apiData);
      console.log('AddPartDialog: Part created successfully:', newPart);

      PartsFormValidator.showSuccessToast('Part added successfully');
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Refresh parts data
      await onPartAdded();

    } catch (error) {
      console.error('AddPartDialog: Error creating part:', error);
      const errorMessage = PartsFormValidator.handleApiError(error);
      PartsFormValidator.showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Part to Work Order</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <BasicPartFields form={form} />
            
            <PartTypeAndStatusFields form={form} />
            
            <JobLineSelector 
              form={form} 
              jobLines={jobLines}
              workOrderId={workOrderId}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add Part'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
