
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPartFormValues, WORK_ORDER_PART_STATUSES, PART_TYPES } from '@/types/workOrderPart';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { BasicPartFields } from './BasicPartFields';
import { PartTypeAndStatusFields } from './PartTypeAndStatusFields';
import { SelectJobLine } from './SelectJobLine';
import { toast } from 'sonner';

// Create Zod schema that matches WorkOrderPartFormValues exactly
const addPartFormSchema = z.object({
  name: z.string().min(1, "Part name is required"),
  part_number: z.string().min(1, "Part number is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Unit price must be non-negative"),
  total_price: z.number().optional(),
  status: z.enum(WORK_ORDER_PART_STATUSES as readonly [string, ...string[]]),
  notes: z.string().optional(),
  job_line_id: z.string().optional(),
  category: z.string().optional(),
  part_type: z.enum(PART_TYPES as readonly [string, ...string[]]),
  
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

// Create a type from the schema for internal use
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
      part_type: 'inventory',
      notes: '',
      job_line_id: '',
      category: '',
      
      // Extended fields defaults
      customerPrice: undefined,
      supplierCost: undefined,
      retailPrice: undefined,
      markupPercentage: undefined,
      isTaxable: false,
      coreChargeAmount: undefined,
      coreChargeApplied: false,
      warrantyDuration: undefined,
      warrantyExpiryDate: undefined,
      installDate: undefined,
      installedBy: undefined,
      invoiceNumber: undefined,
      poLine: undefined,
      isStockItem: false,
      supplierName: undefined,
      supplierOrderRef: undefined,
      notesInternal: undefined,
      inventoryItemId: undefined,
      estimatedArrivalDate: undefined,
      itemStatus: undefined
    }
  });

  // Watch quantity and unit_price to calculate total_price
  const watchedQuantity = form.watch('quantity');
  const watchedUnitPrice = form.watch('unit_price');

  React.useEffect(() => {
    const quantity = watchedQuantity || 0;
    const unitPrice = watchedUnitPrice || 0;
    const totalPrice = quantity * unitPrice;
    form.setValue('total_price', totalPrice);
  }, [watchedQuantity, watchedUnitPrice, form]);

  const handleSubmit = async (values: AddPartFormValues) => {
    try {
      setIsSubmitting(true);
      console.log('Adding part with values:', values);

      // Convert form values to WorkOrderPartFormValues format
      const partData: WorkOrderPartFormValues = {
        name: values.name,
        part_number: values.part_number,
        description: values.description,
        quantity: values.quantity,
        unit_price: values.unit_price,
        total_price: values.total_price,
        status: values.status,
        notes: values.notes,
        job_line_id: values.job_line_id || undefined,
        category: values.category,
        part_type: values.part_type,
        
        // Extended fields
        customerPrice: values.customerPrice,
        supplierCost: values.supplierCost,
        retailPrice: values.retailPrice,
        markupPercentage: values.markupPercentage,
        isTaxable: values.isTaxable,
        coreChargeAmount: values.coreChargeAmount,
        coreChargeApplied: values.coreChargeApplied,
        warrantyDuration: values.warrantyDuration,
        warrantyExpiryDate: values.warrantyExpiryDate,
        installDate: values.installDate,
        installedBy: values.installedBy,
        invoiceNumber: values.invoiceNumber,
        poLine: values.poLine,
        isStockItem: values.isStockItem,
        supplierName: values.supplierName,
        supplierOrderRef: values.supplierOrderRef,
        notesInternal: values.notesInternal,
        inventoryItemId: values.inventoryItemId,
        estimatedArrivalDate: values.estimatedArrivalDate,
        itemStatus: values.itemStatus
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

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <BasicPartFields form={form} />
            
            <PartTypeAndStatusFields form={form} />
            
            <SelectJobLine 
              form={form} 
              jobLines={jobLines} 
              workOrderId={workOrderId} 
            />

            <div className="flex justify-end gap-3 pt-4">
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
