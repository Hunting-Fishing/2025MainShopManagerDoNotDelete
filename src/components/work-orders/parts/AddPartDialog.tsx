
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { addWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { SupplierSelector } from './SupplierSelector';
import { toast } from '@/hooks/use-toast';

const partFormSchema = z.object({
  name: z.string().min(1, 'Part name is required'),
  part_number: z.string().min(1, 'Part number is required'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  status: z.string().optional(),
  notes: z.string().optional(),
  job_line_id: z.string().optional(),
  supplierName: z.string().optional(),
});

interface AddPartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onPartAdded: () => void;
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
      status: 'pending',
      notes: '',
      job_line_id: '',
      supplierName: '',
    },
  });

  const onSubmit = async (data: WorkOrderPartFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Calculate total price
      const totalPrice = data.quantity * data.unit_price;
      
      // Prepare the part data
      const partData = {
        ...data,
        work_order_id: workOrderId,
        total_price: totalPrice,
      };

      // Call addWorkOrderPart with the correct arguments
      await addWorkOrderPart(workOrderId, partData);
      
      toast({
        title: "Success",
        description: "Part added successfully",
      });
      
      form.reset();
      onPartAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: "Error",
        description: "Failed to add part",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Part</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Part Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Part Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
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
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="job_line_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Line</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job line..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
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
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="ordered">Ordered</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="installed">Installed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SupplierSelector form={form} />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
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
