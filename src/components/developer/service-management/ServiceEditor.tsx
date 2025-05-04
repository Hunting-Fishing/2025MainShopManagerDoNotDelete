
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface ServiceEditorProps {
  selectedCategory: ServiceMainCategory | null;
  selectedSubcategory: ServiceSubcategory | null;
  selectedJob: ServiceJob | null;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

const subcategorySchema = z.object({
  name: z.string().min(1, 'Subcategory name is required'),
  description: z.string().optional(),
});

const jobSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'Price must be a positive number').optional()
  ),
  estimatedTime: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().min(0, 'Time must be a positive number').optional()
  ),
});

const ServiceEditor: React.FC<ServiceEditorProps> = ({
  selectedCategory,
  selectedSubcategory,
  selectedJob,
  onSave,
  onCancel,
}) => {
  let schema;
  let defaultValues = {};
  let title = '';

  if (selectedJob) {
    schema = jobSchema;
    defaultValues = {
      name: selectedJob.name,
      description: selectedJob.description || '',
      price: selectedJob.price || '',
      estimatedTime: selectedJob.estimatedTime || '',
    };
    title = 'Edit Service';
  } else if (selectedSubcategory) {
    schema = subcategorySchema;
    defaultValues = {
      name: selectedSubcategory.name,
      description: selectedSubcategory.description || '',
    };
    title = 'Edit Subcategory';
  } else {
    schema = categorySchema;
    defaultValues = {
      name: selectedCategory?.name || '',
      description: selectedCategory?.description || '',
    };
    title = selectedCategory ? 'Edit Category' : 'Add Category';
  }

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = (data: any) => {
    onSave(data);
    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter description (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedJob && (
              <>
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          placeholder="Enter price" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Time (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          placeholder="Enter time in minutes" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ServiceEditor;
