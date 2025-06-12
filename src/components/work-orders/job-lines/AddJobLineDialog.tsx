
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkOrderJobLine, JOB_LINE_STATUSES } from '@/types/jobLine';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const jobLineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  estimated_hours: z.number().min(0).optional(),
  labor_rate: z.number().min(0).optional(),
  status: z.enum(JOB_LINE_STATUSES).default('pending'),
  notes: z.string().optional(),
});

type JobLineFormValues = z.infer<typeof jobLineSchema>;

interface AddJobLineDialogProps {
  workOrderId: string;
  onJobLineAdd: (jobLines: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[]) => void;
}

export function AddJobLineDialog({ workOrderId, onJobLineAdd }: AddJobLineDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<JobLineFormValues>({
    resolver: zodResolver(jobLineSchema),
    defaultValues: {
      name: '',
      category: '',
      subcategory: '',
      description: '',
      estimated_hours: 0,
      labor_rate: 0,
      status: 'pending',
      notes: '',
    },
  });

  const onSubmit = async (values: JobLineFormValues) => {
    try {
      setIsSubmitting(true);
      
      const totalAmount = (values.estimated_hours || 0) * (values.labor_rate || 0);
      
      const newJobLine: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'> = {
        work_order_id: workOrderId,
        name: values.name,
        category: values.category,
        subcategory: values.subcategory,
        description: values.description,
        estimated_hours: values.estimated_hours,
        labor_rate: values.labor_rate,
        total_amount: totalAmount,
        status: values.status,
        notes: values.notes,
        display_order: 0,
      };

      onJobLineAdd([newJobLine]);
      
      toast({
        title: "Success",
        description: "Job line added successfully",
      });
      
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error adding job line:', error);
      toast({
        title: "Error",
        description: "Failed to add job line",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Job Line
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
          <DialogDescription>
            Add a new job line to this work order.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Job line name" {...field} />
                    </FormControl>
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
                        {JOB_LINE_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Category" {...field} />
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
                      <Input placeholder="Subcategory" {...field} />
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
                    <Textarea placeholder="Job line description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        placeholder="0"
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
                    <FormLabel>Labor Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
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
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Job Line'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
