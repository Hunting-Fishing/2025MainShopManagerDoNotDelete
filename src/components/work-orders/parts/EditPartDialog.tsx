
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { PartTypeAndStatusFields } from './PartTypeAndStatusFields';
import { AdvancedPartFields } from './AdvancedPartFields';
import { toast } from 'sonner';

const editPartSchema = z.object({
  name: z.string().min(1, 'Part name is required'),
  part_number: z.string().min(1, 'Part number is required'),
  part_type: z.enum(['inventory', 'non-inventory']),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
  unit_price: z.number().min(0, 'Price cannot be negative').default(0),
  status: z.string().optional().default('pending'),
  notes: z.string().optional(),
  job_line_id: z.string().optional(),
  category: z.string().optional(),
  supplierName: z.string().optional(),
  supplierCost: z.number().optional(),
  retailPrice: z.number().optional(),
  markupPercentage: z.number().optional(),
  isTaxable: z.boolean().optional(),
  coreChargeAmount: z.number().optional(),
  coreChargeApplied: z.boolean().optional(),
  warrantyDuration: z.string().optional(),
  invoiceNumber: z.string().optional(),
  isStockItem: z.boolean().optional(),
});

interface EditPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part: WorkOrderPart;
  jobLines: WorkOrderJobLine[];
  onSave: (formData: WorkOrderPartFormValues) => Promise<void>;
}

export function EditPartDialog({
  open,
  onOpenChange,
  part,
  jobLines,
  onSave
}: EditPartDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkOrderPartFormValues>({
    resolver: zodResolver(editPartSchema),
    defaultValues: {
      name: part.name || '',
      part_number: part.part_number || '',
      part_type: (part.part_type as 'inventory' | 'non-inventory') || 'inventory',
      description: part.description || '',
      quantity: part.quantity || 1,
      unit_price: part.unit_price || 0,
      status: part.status || 'pending',
      notes: part.notes || '',
      job_line_id: part.job_line_id || '',
      category: part.category || '',
      supplierName: part.supplierName || '',
      supplierCost: part.supplierCost || 0,
      retailPrice: part.retailPrice || 0,
      markupPercentage: part.markupPercentage || 0,
      isTaxable: part.isTaxable || false,
      coreChargeAmount: part.coreChargeAmount || 0,
      coreChargeApplied: part.coreChargeApplied || false,
      warrantyDuration: part.warrantyDuration || '',
      invoiceNumber: part.invoiceNumber || '',
      isStockItem: part.isStockItem || false,
    },
  });

  const handleSubmit = async (data: WorkOrderPartFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Calculate total price
      const total_price = (data.quantity || 0) * (data.unit_price || 0);
      
      const formData: WorkOrderPartFormValues = {
        ...data,
        total_price,
      };

      await onSave(formData);
      onOpenChange(false);
      toast.success('Part updated successfully');
    } catch (error) {
      console.error('Error updating part:', error);
      toast.error('Failed to update part');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Part</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter part name..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="part_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Number *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter part number..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Part Type and Status */}
            <PartTypeAndStatusFields form={form} />

            {/* Advanced Fields */}
            <AdvancedPartFields form={form} />

            {/* Description and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Enter part description..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Enter any additional notes..."
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Job Line Assignment */}
            {jobLines.length > 0 && (
              <FormField
                control={form.control}
                name="job_line_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Job Line</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job line..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Assignment</SelectItem>
                          {jobLines.map((jobLine) => (
                            <SelectItem key={jobLine.id} value={jobLine.id}>
                              {jobLine.name} - {jobLine.category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
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
                {isSubmitting ? 'Updating...' : 'Update Part'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
