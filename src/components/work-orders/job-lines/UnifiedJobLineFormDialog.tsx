
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { WorkOrderJobLine, LaborRateType, JobLineStatus } from '@/types/jobLine';
import { createJobLine } from '@/services/workOrder/jobLinesService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const jobLineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  estimated_hours: z.number().min(0).optional(),
  labor_rate: z.number().min(0).optional(),
  labor_rate_type: z.enum(['standard', 'overtime', 'premium', 'flat_rate']).optional(),
  status: z.enum(['pending', 'in-progress', 'completed', 'on-hold']).optional(),
  display_order: z.number().optional(),
  notes: z.string().optional(),
});

type JobLineFormData = z.infer<typeof jobLineSchema>;

interface UnifiedJobLineFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  onJobLineAdd: (jobLines: WorkOrderJobLine[]) => void;
  existingJobLine?: WorkOrderJobLine;
}

export function UnifiedJobLineFormDialog({
  open,
  onOpenChange,
  workOrderId,
  onJobLineAdd,
  existingJobLine
}: UnifiedJobLineFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<JobLineFormData>({
    resolver: zodResolver(jobLineSchema),
    defaultValues: {
      name: existingJobLine?.name || '',
      category: existingJobLine?.category || '',
      subcategory: existingJobLine?.subcategory || '',
      description: existingJobLine?.description || '',
      estimated_hours: existingJobLine?.estimated_hours || 0,
      labor_rate: existingJobLine?.labor_rate || 0,
      labor_rate_type: (existingJobLine?.labor_rate_type as LaborRateType) || 'standard',
      status: (existingJobLine?.status as JobLineStatus) || 'pending',
      display_order: existingJobLine?.display_order || 0,
      notes: existingJobLine?.notes || '',
    },
  });

  const onSubmit = async (data: JobLineFormData) => {
    console.log('🔧 UnifiedJobLineFormDialog - Form submission started', { data, workOrderId });
    
    if (!workOrderId) {
      console.error('🔧 UnifiedJobLineFormDialog - No work order ID provided');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Work order ID is required to add job lines.",
      });
      return;
    }

    // Validate required fields
    if (!data.name || data.name.trim() === '') {
      console.error('🔧 UnifiedJobLineFormDialog - Name is required');
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Job line name is required.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate total amount
      const estimatedHours = data.estimated_hours || 0;
      const laborRate = data.labor_rate || 0;
      const totalAmount = estimatedHours * laborRate;

      // Prepare job line data with all required fields
      const jobLineData = {
        work_order_id: workOrderId,
        name: data.name.trim(),
        category: data.category || '',
        subcategory: data.subcategory || '',
        description: data.description || '',
        estimated_hours: estimatedHours,
        labor_rate: laborRate,
        labor_rate_type: data.labor_rate_type || 'standard',
        total_amount: totalAmount,
        status: data.status || 'pending',
        display_order: data.display_order || 0,
        notes: data.notes || '',
      };

      console.log('🔧 UnifiedJobLineFormDialog - Prepared job line data:', jobLineData);

      const newJobLine = await createJobLine(jobLineData);
      
      console.log('🔧 UnifiedJobLineFormDialog - Job line created successfully:', newJobLine);
      
      // Add the new job line to the list
      onJobLineAdd([newJobLine]);
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: "Job line added successfully.",
      });

    } catch (error) {
      console.error('🔧 UnifiedJobLineFormDialog - Error creating job line:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to create job line. Please try again.';
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total amount when hours or rate changes
  const estimatedHours = form.watch('estimated_hours') || 0;
  const laborRate = form.watch('labor_rate') || 0;
  const totalAmount = estimatedHours * laborRate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingJobLine ? 'Edit Job Line' : 'Add Job Line'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter job line name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter category" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter subcategory" />
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
                    <Textarea {...field} placeholder="Enter description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="estimated_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.25"
                        min="0"
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
                name="labor_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labor Rate ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Total Amount</Label>
                <div className="px-3 py-2 bg-gray-50 border rounded-md">
                  ${totalAmount.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="labor_rate_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labor Rate Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rate type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="overtime">Overtime</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="flat_rate">Flat Rate</SelectItem>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Additional notes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {existingJobLine ? 'Update Job Line' : 'Add Job Line'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
