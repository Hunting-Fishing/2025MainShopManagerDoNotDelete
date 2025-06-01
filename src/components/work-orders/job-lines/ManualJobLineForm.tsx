
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { WorkOrderJobLine } from '@/types/jobLine';

const jobLineSchema = z.object({
  name: z.string().min(1, 'Job line name is required'),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  laborRate: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type JobLineFormValues = z.infer<typeof jobLineSchema>;

interface ManualJobLineFormProps {
  onSubmit: (jobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function ManualJobLineForm({ onSubmit }: ManualJobLineFormProps) {
  const form = useForm<JobLineFormValues>({
    resolver: zodResolver(jobLineSchema),
    defaultValues: {
      name: '',
      category: '',
      subcategory: '',
      description: '',
      estimatedHours: undefined,
      laborRate: undefined,
      notes: '',
    },
  });

  const handleSubmit = (data: JobLineFormValues) => {
    const totalAmount = data.estimatedHours && data.laborRate 
      ? data.estimatedHours * data.laborRate 
      : data.laborRate || 0;

    onSubmit({
      workOrderId: '', // Will be set by parent
      name: data.name,
      category: data.category,
      subcategory: data.subcategory,
      description: data.description,
      estimatedHours: data.estimatedHours,
      laborRate: data.laborRate,
      totalAmount,
      status: 'pending',
      notes: data.notes,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Line Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter job line name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category" {...field} />
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
                  <Input placeholder="Enter subcategory" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="estimatedHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.25"
                      placeholder="0.0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="laborRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter job line description"
                  className="min-h-[80px]"
                  {...field} 
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
                  placeholder="Additional notes"
                  className="min-h-[60px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit">Add Job Line</Button>
        </div>
      </form>
    </Form>
  );
}
