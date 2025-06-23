
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkOrderPart, WorkOrderPartFormValues, PART_TYPES, WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { updateWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { PartsFormValidator } from '@/utils/partsErrorHandler';
import { BasicPartFields } from './BasicPartFields';
import { JobLineSelector } from './JobLineSelector';
import { PartTypeAndStatusFields } from './PartTypeAndStatusFields';

const editPartSchema = z.object({
  name: z.string().min(2, 'Part name must be at least 2 characters'),
  part_number: z.string().min(3, 'Part number must be at least 3 characters'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  status: z.enum(WORK_ORDER_PART_STATUSES).default('pending'),
  notes: z.string().optional(),
  job_line_id: z.string().optional(),
  part_type: z.enum(PART_TYPES),
});

type EditPartFormValues = z.infer<typeof editPartSchema>;

interface EditPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part: WorkOrderPart;
  jobLines: WorkOrderJobLine[];
  onPartUpdated: () => Promise<void>;
}

export function EditPartDialog({
  open,
  onOpenChange,
  part,
  jobLines,
  onPartUpdated
}: EditPartDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<EditPartFormValues>({
    resolver: zodResolver(editPartSchema),
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
    }
  });

  // Update form when part changes
  useEffect(() => {
    if (part && open) {
      form.reset({
        name: part.name || '',
        part_number: part.part_number || '',
        description: part.description || '',
        quantity: part.quantity || 1,
        unit_price: part.unit_price || 0,
        status: part.status as any || 'pending',
        notes: part.notes || '',
        job_line_id: part.job_line_id || undefined,
        part_type: (part.part_type as any) || 'inventory',
      });
    }
  }, [part, open, form]);

  const onSubmit = async (data: EditPartFormValues) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const updateData: Partial<WorkOrderPartFormValues> = {
        name: data.name,
        part_number: data.part_number,
        description: data.description,
        quantity: data.quantity,
        unit_price: data.unit_price,
        status: data.status,
        notes: data.notes,
        job_line_id: data.job_line_id === 'none' ? undefined : data.job_line_id,
        part_type: data.part_type,
      };

      await updateWorkOrderPart(part.id, updateData);
      
      PartsFormValidator.showSuccessToast('Part updated successfully');
      await onPartUpdated();
      
    } catch (error) {
      console.error('Error updating part:', error);
      const errorMessage = PartsFormValidator.handleApiError(error);
      setSubmitError(errorMessage);
      PartsFormValidator.showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Part: {part.name}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {submitError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <BasicPartFields form={form} />
            <JobLineSelector form={form} jobLines={jobLines} />
            <PartTypeAndStatusFields form={form} />

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Part'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
