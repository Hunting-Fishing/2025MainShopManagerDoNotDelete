
import React, { useState } from 'react';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { SelectJobLine } from './SelectJobLine';
import { PartTypeAndStatusFields } from './PartTypeAndStatusFields';
import { WorkOrderJobLine } from '@/types/jobLine';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Part name must be at least 2 characters.'
  }),
  part_number: z.string().min(2, {
    message: 'Part number must be at least 2 characters.'
  }),
  description: z.string().optional(),
  quantity: z.number().min(1, {
    message: 'Quantity must be at least 1.'
  }).default(1),
  unit_price: z.number().min(0, {
    message: 'Unit price must be at least 0.'
  }).default(0),
  total_price: z.number().optional(),
  status: z.string().optional().default('pending'),
  notes: z.string().optional(),
  job_line_id: z.string().optional(),
  category: z.string().optional(),
  part_type: z.string().optional().default('inventory'),
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
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      part_number: '',
      quantity: 1,
      unit_price: 0,
      status: 'pending',
      part_type: 'inventory'
    }
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting part form:', values);
      
      // Create the part with work order ID  
      const partData = {
        ...values,
        work_order_id: workOrderId
      };
      
      await createWorkOrderPart(partData);
      console.log('Part created successfully');
      
      toast.success('Part added successfully');
      
      // Close dialog and refresh data
      onOpenChange(false);
      form.reset();
      
      // Notify parent to refresh data
      if (onPartAdded) {
        await onPartAdded();
      }
    } catch (error) {
      console.error('Error creating part:', error);
      toast.error('Failed to add part');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Part</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the details for the new part.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Part Name" {...field} />
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
                      <Input placeholder="Part Number" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Part description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
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
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <PartTypeAndStatusFields form={form} />

            <SelectJobLine 
              form={form} 
              jobLines={jobLines} 
              workOrderId={workOrderId} 
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>
                Cancel
              </AlertDialogCancel>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Part'
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
