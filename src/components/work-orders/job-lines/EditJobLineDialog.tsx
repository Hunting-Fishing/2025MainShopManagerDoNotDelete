import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkOrderJobLine, JOB_LINE_STATUSES } from '@/types/jobLine';
import { toast } from '@/hooks/use-toast';
const editJobLineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  estimated_hours: z.number().min(0).optional(),
  labor_rate: z.number().min(0).optional(),
  status: z.enum(JOB_LINE_STATUSES),
  notes: z.string().optional()
});
type EditJobLineFormValues = z.infer<typeof editJobLineSchema>;
interface EditJobLineDialogProps {
  jobLine: WorkOrderJobLine;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedJobLine: WorkOrderJobLine) => void;
}
export function EditJobLineDialog({
  jobLine,
  open,
  onOpenChange,
  onUpdate
}: EditJobLineDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<EditJobLineFormValues>({
    resolver: zodResolver(editJobLineSchema),
    defaultValues: {
      name: jobLine.name || '',
      category: jobLine.category || '',
      subcategory: jobLine.subcategory || '',
      description: jobLine.description || '',
      estimated_hours: jobLine.estimated_hours || 0,
      labor_rate: jobLine.labor_rate || 0,
      status: jobLine.status as any || 'pending',
      notes: jobLine.notes || ''
    }
  });
  const onSubmit = async (values: EditJobLineFormValues) => {
    try {
      setIsSubmitting(true);
      const totalAmount = (values.estimated_hours || 0) * (values.labor_rate || 0);
      const updatedJobLine: WorkOrderJobLine = {
        ...jobLine,
        name: values.name,
        category: values.category,
        subcategory: values.subcategory,
        description: values.description,
        estimated_hours: values.estimated_hours,
        labor_rate: values.labor_rate,
        total_amount: totalAmount,
        status: values.status,
        notes: values.notes,
        updated_at: new Date().toISOString()
      };
      onUpdate(updatedJobLine);
      toast({
        title: "Success",
        description: "Job line updated successfully"
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating job line:', error);
      toast({
        title: "Error",
        description: "Failed to update job line",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-cyan-200">
        <DialogHeader>
          <DialogTitle>Edit Job Line</DialogTitle>
          <DialogDescription>
            Update the job line details.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({
              field
            }) => <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Job line name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="status" render={({
              field
            }) => <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JOB_LINE_STATUSES.map(status => <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="category" render={({
              field
            }) => <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="subcategory" render={({
              field
            }) => <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <FormControl>
                      <Input placeholder="Subcategory" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>

            <FormField control={form.control} name="description" render={({
            field
          }) => <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Job line description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="estimated_hours" render={({
              field
            }) => <FormItem>
                    <FormLabel>Estimated Hours</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.25" placeholder="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="labor_rate" render={({
              field
            }) => <FormItem>
                    <FormLabel>Labor Rate</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>

            <FormField control={form.control} name="notes" render={({
            field
          }) => <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Job Line'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
}