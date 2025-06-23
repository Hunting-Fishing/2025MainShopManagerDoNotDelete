import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPartFormValues, PART_TYPES, WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { PartsFormValidator, PartsFormError } from '@/utils/partsErrorHandler';
import { BasicPartFields } from './BasicPartFields';
import { JobLineSelector } from './JobLineSelector';
import { PartTypeAndStatusFields } from './PartTypeAndStatusFields';
import { AdvancedPartFields } from './AdvancedPartFields';
import { toast } from 'sonner';
const addPartSchema = z.object({
  name: z.string().min(2, 'Part name must be at least 2 characters'),
  part_number: z.string().min(3, 'Part number must be at least 3 characters'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  status: z.enum(WORK_ORDER_PART_STATUSES).default('pending'),
  notes: z.string().optional(),
  job_line_id: z.string().optional(),
  part_type: z.enum(PART_TYPES),
  category: z.string().optional(),
  supplierName: z.string().optional(),
  supplierCost: z.number().min(0).optional(),
  retailPrice: z.number().min(0).optional(),
  markupPercentage: z.number().min(0).max(1000).optional(),
  isTaxable: z.boolean().default(false),
  coreChargeAmount: z.number().min(0).optional(),
  coreChargeApplied: z.boolean().default(false),
  warrantyDuration: z.string().optional(),
  isStockItem: z.boolean().default(false)
});
type AddPartFormValues = z.infer<typeof addPartSchema>;
interface EnhancedAddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onPartAdded: () => Promise<void>;
}
export function EnhancedAddPartDialog({
  open,
  onOpenChange,
  workOrderId,
  jobLines,
  onPartAdded
}: EnhancedAddPartDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<PartsFormError[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  console.log('EnhancedAddPartDialog render:', {
    open,
    workOrderId,
    jobLinesCount: jobLines.length
  });
  const form = useForm<AddPartFormValues>({
    resolver: zodResolver(addPartSchema),
    defaultValues: {
      name: '',
      part_number: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      status: 'pending',
      notes: '',
      job_line_id: undefined,
      part_type: 'inventory',
      category: '',
      supplierName: '',
      supplierCost: undefined,
      retailPrice: undefined,
      markupPercentage: undefined,
      isTaxable: false,
      coreChargeAmount: undefined,
      coreChargeApplied: false,
      warrantyDuration: '',
      isStockItem: false
    }
  });
  const resetForm = useCallback(() => {
    form.reset();
    setSubmitError(null);
    setValidationErrors([]);
    setSubmitSuccess(false);
  }, [form]);
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      resetForm();
      onOpenChange(false);
    }
  }, [isSubmitting, resetForm, onOpenChange]);
  const validateFormData = useCallback((data: AddPartFormValues): PartsFormError[] => {
    console.log('Validating form data:', data);
    const errors = PartsFormValidator.validatePartForm(data);

    // Additional business logic validations
    if (data.supplierCost && data.unit_price && data.supplierCost > data.unit_price) {
      errors.push({
        field: 'unit_price',
        message: 'Customer price should not be less than supplier cost'
      });
    }
    if (data.coreChargeApplied && !data.coreChargeAmount) {
      errors.push({
        field: 'coreChargeAmount',
        message: 'Core charge amount is required when core charge is applied'
      });
    }
    return errors;
  }, []);
  const onSubmit = useCallback(async (data: AddPartFormValues) => {
    try {
      console.log('Submitting part form:', data);
      setIsSubmitting(true);
      setSubmitError(null);
      setValidationErrors([]);

      // Validate work order ID
      if (!workOrderId) {
        throw new Error('Work order ID is required');
      }

      // Client-side validation
      const errors = validateFormData(data);
      if (errors.length > 0) {
        setValidationErrors(errors);
        PartsFormValidator.showValidationErrors(errors);
        return;
      }

      // Convert form data to service format
      const partData: WorkOrderPartFormValues = {
        name: data.name,
        part_number: data.part_number,
        description: data.description,
        quantity: data.quantity,
        unit_price: data.unit_price,
        status: data.status,
        notes: data.notes,
        job_line_id: data.job_line_id === 'none' ? undefined : data.job_line_id,
        part_type: data.part_type,
        category: data.category,
        supplierName: data.supplierName,
        supplierCost: data.supplierCost,
        retailPrice: data.retailPrice,
        markupPercentage: data.markupPercentage,
        isTaxable: data.isTaxable,
        coreChargeAmount: data.coreChargeAmount,
        coreChargeApplied: data.coreChargeApplied,
        warrantyDuration: data.warrantyDuration,
        isStockItem: data.isStockItem
      };
      console.log('Creating work order part with data:', partData);

      // Create the part
      const createdPart = await createWorkOrderPart(workOrderId, partData);
      console.log('Part created successfully:', createdPart.id);

      // Show success state briefly
      setSubmitSuccess(true);
      PartsFormValidator.showSuccessToast('Part added successfully');

      // Wait a moment to show success, then close and refresh
      setTimeout(async () => {
        try {
          await onPartAdded();
          handleClose();
        } catch (refreshError) {
          console.error('Error refreshing parts after creation:', refreshError);
          toast.error('Part was created but failed to refresh the list');
        }
      }, 1000);
    } catch (error) {
      console.error('Error creating part:', error);
      const errorMessage = PartsFormValidator.handleApiError(error);
      setSubmitError(errorMessage);
      PartsFormValidator.showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [workOrderId, validateFormData, onPartAdded, handleClose]);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);
  return <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-stone-50">
        <DialogHeader>
          <DialogTitle>Add New Part to Work Order</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Display */}
            {submitError && <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>}

            {/* Validation Errors */}
            {validationErrors.length > 0 && <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">Please fix the following errors:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => <li key={index} className="text-sm">{error.message}</li>)}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>}

            {/* Success Display */}
            {submitSuccess && <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Part added successfully! Refreshing data...
                </AlertDescription>
              </Alert>}

            {/* Form Fields */}
            <BasicPartFields form={form} />
            
            <JobLineSelector form={form} jobLines={jobLines} />
            
            <PartTypeAndStatusFields form={form} />

            <AdvancedPartFields form={form} />

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || submitSuccess} className="min-w-[120px]">
                {isSubmitting ? <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </> : submitSuccess ? <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Added!
                  </> : 'Add Part'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
}