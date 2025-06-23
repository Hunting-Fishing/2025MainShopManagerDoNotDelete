
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { WorkOrderJobLine } from '@/types/jobLine';
import { 
  WORK_ORDER_PART_STATUSES, 
  PART_TYPES,
  WorkOrderPartFormValues 
} from '@/types/workOrderPart';
import { createWorkOrderPart } from '@/services/workOrder';
import { BasicPartFields } from './BasicPartFields';
import { JobLineSelector } from './JobLineSelector';
import { PartTypeAndStatusFields } from './PartTypeAndStatusFields';

// Create mutable arrays from readonly constants for Zod enum
const statusValues = [...WORK_ORDER_PART_STATUSES] as [string, ...string[]];
const partTypeValues = [...PART_TYPES] as [string, ...string[]];

// Form schema that matches WorkOrderPartFormValues
const addPartFormSchema = z.object({
  name: z.string().min(1, "Part name is required"),
  part_number: z.string().min(1, "Part number is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Unit price must be 0 or greater"),
  total_price: z.number().optional(),
  status: z.enum(statusValues),
  notes: z.string().optional(),
  job_line_id: z.string().optional(),
  category: z.string().optional(),
  part_type: z.enum(partTypeValues),
  
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
  itemStatus: z.string().optional(),
});

type AddPartFormValues = z.infer<typeof addPartFormSchema>;

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

  const form = useForm<AddPartFormValues>({
    resolver: zodResolver(addPartFormSchema),
    defaultValues: {
      name: '',
      part_number: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      status: 'pending',
      notes: '',
      job_line_id: '',
      category: '',
      part_type: 'inventory',
      customerPrice: 0,
      supplierCost: 0,
      retailPrice: 0,
      markupPercentage: 0,
      isTaxable: false,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      warrantyDuration: '',
      warrantyExpiryDate: '',
      installDate: '',
      installedBy: '',
      invoiceNumber: '',
      poLine: '',
      isStockItem: false,
      supplierName: '',
      supplierOrderRef: '',
      notesInternal: '',
      inventoryItemId: '',
      estimatedArrivalDate: '',
      itemStatus: '',
    },
  });

  // Watch quantity and unit_price to calculate total_price
  const quantity = form.watch('quantity');
  const unitPrice = form.watch('unit_price');

  useEffect(() => {
    const totalPrice = quantity * unitPrice;
    form.setValue('total_price', totalPrice);
  }, [quantity, unitPrice, form]);

  const onSubmit = async (values: AddPartFormValues) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log('Submitting part data:', values);

      // Convert form values to match the expected API format
      const partData: WorkOrderPartFormValues = {
        ...values,
        total_price: values.quantity * values.unit_price,
      };

      const result = await createWorkOrderPart(workOrderId, partData);
      console.log('Part created successfully:', result);

      toast.success('Part added successfully');
      
      // Reset form
      form.reset();
      
      // Refresh parts data
      await onPartAdded();
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding part:', error);
      toast.error('Failed to add part. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!isSubmitting) {
      onOpenChange(open);
      if (!open) {
        form.reset();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Part to Work Order</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicPartFields form={form} />
            
            <JobLineSelector 
              form={form}
              jobLines={jobLines}
            />
            
            <PartTypeAndStatusFields form={form} />

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogClose(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Part...' : 'Add Part'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
