
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategorySelector } from '@/components/inventory/categories/CategorySelector';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WORK_ORDER_PART_STATUSES, PART_TYPES } from '@/types/workOrderPart';
import { toast } from '@/hooks/use-toast';

// Schema for part form validation
const partFormSchema = z.object({
  name: z.string().min(1, 'Part name is required'),
  part_number: z.string().min(1, 'Part number is required'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  total_price: z.number().min(0, 'Total price must be non-negative'),
  status: z.enum(WORK_ORDER_PART_STATUSES),
  notes: z.string().optional(),
  job_line_id: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  part_type: z.enum(PART_TYPES),
});

type PartFormValues = z.infer<typeof partFormSchema>;

interface UltimateAddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onPartAdded: () => void;
}

export function UltimateAddPartDialog({
  open,
  onOpenChange,
  workOrderId,
  jobLines,
  onPartAdded
}: UltimateAddPartDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PartFormValues>({
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
    },
  });

  // Calculate total price when quantity or unit price changes
  const watchQuantity = form.watch('quantity');
  const watchUnitPrice = form.watch('unit_price');

  React.useEffect(() => {
    const totalPrice = watchQuantity * watchUnitPrice;
    form.setValue('total_price', totalPrice);
  }, [watchQuantity, watchUnitPrice, form]);

  const onSubmit = async (values: PartFormValues) => {
    setIsSubmitting(true);
    try {
      await createWorkOrderPart({
        work_order_id: workOrderId,
        job_line_id: values.job_line_id === 'unassigned' ? null : values.job_line_id || null,
        part_number: values.part_number,
        name: values.name,
        description: values.description || null,
        quantity: values.quantity,
        unit_price: values.unit_price,
        total_price: values.total_price,
        status: values.status,
        notes: values.notes || null,
        category: values.category,
        part_type: values.part_type,
      });

      toast({
        title: 'Success',
        description: 'Part added successfully',
      });

      form.reset();
      onPartAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: 'Error',
        description: 'Failed to add part. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="modern-dialog max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-border/20">
          <DialogTitle className="text-xl font-bold text-foreground gradient-text">
            Add New Part
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground font-heading">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Part Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter part name"
                          className="modern-input"
                          {...field}
                        />
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
                      <FormLabel className="text-sm font-medium text-foreground">
                        Part Number *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter part number"
                          className="modern-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter part description"
                        className="modern-input resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Category and Classification */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground font-heading">
                Classification
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Category *
                      </FormLabel>
                      <FormControl>
                        <CategorySelector
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select a category"
                          className="modern-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="part_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Part Type *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="modern-input">
                            <SelectValue placeholder="Select part type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="modern-dropdown">
                          {PART_TYPES.map((type) => (
                            <SelectItem key={type} value={type} className="capitalize">
                              {type.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Pricing and Quantity */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground font-heading">
                Pricing & Quantity
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Quantity *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          className="modern-input"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Unit Price *
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className="modern-input"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="total_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Total Price
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          className="modern-input bg-muted/30"
                          {...field}
                          readOnly
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Assignment and Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground font-heading">
                Assignment & Status
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="job_line_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Assign to Job Line
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="modern-input">
                            <SelectValue placeholder="Select job line (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="modern-dropdown">
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {jobLines.map((jobLine) => (
                            <SelectItem key={jobLine.id} value={jobLine.id}>
                              {jobLine.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-foreground">
                        Status *
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="modern-input">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="modern-dropdown">
                          {WORK_ORDER_PART_STATUSES.map((status) => (
                            <SelectItem key={status} value={status} className="capitalize">
                              {status.replace(/[-_]/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground font-heading">
                Additional Information
              </h3>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-foreground">
                      Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes or special instructions"
                        className="modern-input resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-border/20">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="modern-button-outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="modern-button-primary"
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
