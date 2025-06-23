
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { BasicPartFields } from './BasicPartFields';
import { PartTypeAndStatusFields } from './PartTypeAndStatusFields';
import { JobLineSelector } from './JobLineSelector';
import { SupplierSelector } from './SupplierSelector';

// Create a Zod schema that matches WorkOrderPartFormValues exactly
const partFormSchema = z.object({
  name: z.string().min(1, "Part name is required"),
  part_number: z.string().min(1, "Part number is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit_price: z.number().min(0, "Unit price must be at least 0"),
  total_price: z.number().optional(),
  status: z.string().min(1, "Status is required"),
  notes: z.string().optional(),
  job_line_id: z.string().optional(),
  category: z.string().optional(),
  part_type: z.string().min(1, "Part type is required"),
  
  // Extended fields - all optional
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
  const [loading, setLoading] = useState(false);

  const form = useForm<WorkOrderPartFormValues>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      name: '',
      part_number: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
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

  const quantity = form.watch('quantity');
  const unitPrice = form.watch('unit_price');

  // Auto-calculate total price when quantity or unit price changes
  React.useEffect(() => {
    const total = (quantity || 0) * (unitPrice || 0);
    form.setValue('total_price', total);
  }, [quantity, unitPrice, form]);

  const onSubmit = async (data: WorkOrderPartFormValues) => {
    try {
      setLoading(true);
      console.log('Creating work order part:', data);

      // Ensure total_price is calculated
      const formData = {
        ...data,
        total_price: (data.quantity || 0) * (data.unit_price || 0),
      };

      await createWorkOrderPart(workOrderId, formData);
      
      console.log('Part created successfully');
      toast.success('Part added successfully');
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Refresh parts data
      await onPartAdded();
    } catch (error) {
      console.error('Error creating part:', error);
      toast.error('Failed to add part');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Part</DialogTitle>
          <DialogDescription>
            Add a new part to this work order
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <BasicPartFields form={form} />
                <PartTypeAndStatusFields form={form} />
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <JobLineSelector 
                  form={form}
                  jobLines={jobLines}
                />
                <SupplierSelector form={form} />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Part'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
