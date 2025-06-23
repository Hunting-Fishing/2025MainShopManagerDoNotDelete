
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPartFormValues, WORK_ORDER_PART_STATUSES, PART_TYPES } from '@/types/workOrderPart';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';
import { BasicPartFields } from './BasicPartFields';
import { PartTypeAndStatusFields } from './PartTypeAndStatusFields';
import { SelectJobLine } from './SelectJobLine';

interface AddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onPartAdded: () => Promise<void>;
}

// Create a Zod schema that matches WorkOrderPartFormValues exactly
const partFormSchema = z.object({
  name: z.string().min(1, "Part name is required"),
  part_number: z.string().min(1, "Part number is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Unit price must be non-negative"),
  total_price: z.number().optional(),
  status: z.enum(WORK_ORDER_PART_STATUSES as [string, ...string[]]),
  notes: z.string().optional(),
  job_line_id: z.string().optional(),
  category: z.string().optional(),
  part_type: z.enum(PART_TYPES as [string, ...string[]]),
  
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

export function AddPartDialog({
  open,
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
      status: 'pending',
      notes: '',
      job_line_id: '',
      category: '',
      part_type: 'inventory',
      
      // Extended fields defaults
      customerPrice: undefined,
      supplierCost: undefined,
      retailPrice: undefined,
      markupPercentage: undefined,
      isTaxable: false,
      coreChargeAmount: undefined,
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

  const handleSubmit = async (data: WorkOrderPartFormValues) => {
    if (!workOrderId) {
      toast.error('No work order ID provided');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Creating part with data:', data);

      // Calculate total price if not provided
      const totalPrice = data.total_price || (data.quantity * data.unit_price);

      const partData = {
        ...data,
        work_order_id: workOrderId,
        total_price: totalPrice,
      };

      const result = await createWorkOrderPart(partData);
      
      if (result) {
        console.log('Part created successfully:', result);
        toast.success('Part added successfully');
        
        // Reset form and close dialog
        form.reset();
        onOpenChange(false);
        
        // Refresh the parts list
        await onPartAdded();
      } else {
        throw new Error('Failed to create part');
      }
    } catch (error) {
      console.error('Error creating part:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add part');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  // Watch quantity and unit price to calculate total
  const quantity = form.watch('quantity');
  const unitPrice = form.watch('unit_price');

  // Update total price when quantity or unit price changes
  React.useEffect(() => {
    if (quantity && unitPrice) {
      const total = quantity * unitPrice;
      form.setValue('total_price', total);
    }
  }, [quantity, unitPrice, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Part to Work Order</DialogTitle>
          <DialogDescription>
            Add a new part to this work order. Fill in the part details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-4">
              <BasicPartFields form={form} />
              <PartTypeAndStatusFields form={form} />
              <SelectJobLine 
                form={form}
                jobLines={jobLines}
                workOrderId={workOrderId}
              />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
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
              >
                {isSubmitting ? 'Adding...' : 'Add Part'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
