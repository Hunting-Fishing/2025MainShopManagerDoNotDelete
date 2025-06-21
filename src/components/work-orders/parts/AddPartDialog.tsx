import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { BasicPartFields } from './BasicPartFields';
import { JobLineSelector } from './JobLineSelector';
import { SupplierSelector } from './SupplierSelector';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';

const partFormSchema = z.object({
  name: z.string().min(1, 'Part name is required'),
  part_number: z.string().min(1, 'Part number is required'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Price must be non-negative'),
  job_line_id: z.string().optional(),
  supplierName: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export interface AddPartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onPartAdded: () => Promise<void>;
}

export function AddPartDialog({
  isOpen,
  onOpenChange,
  workOrderId,
  jobLines,
  onPartAdded
}: AddPartDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkOrderPartFormValues>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      name: '',
      part_number: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      job_line_id: '',
      supplierName: '',
      status: 'pending',
      notes: ''
    }
  });

  const handleSubmit = async (data: WorkOrderPartFormValues) => {
    try {
      setIsSubmitting(true);
      
      const partData = {
        ...data,
        total_price: data.quantity * data.unit_price
      };

      await createWorkOrderPart(workOrderId, partData);
      
      toast.success('Part added successfully');
      await onPartAdded();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <BasicPartFields form={form} />
            
            <JobLineSelector form={form} jobLines={jobLines} />
            
            <SupplierSelector form={form} />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Part'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
