import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceSelectorAdapter } from '@/components/work-orders/fields/services/ServiceSelectorAdapter';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { JobLineFormValues, JOB_LINE_STATUSES } from '@/types/jobLine';

const jobLineSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  laborRate: z.number().min(0).optional(),
});

interface ServiceBasedJobLineFormProps {
  onSubmit: (values: JobLineFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ServiceBasedJobLineForm({ onSubmit, onCancel, isSubmitting = false }: ServiceBasedJobLineFormProps) {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const { categories, loading: categoriesLoading } = useServiceCategories();

  const form = useForm<JobLineFormValues>({
    resolver: zodResolver(jobLineSchema),
    defaultValues: {
      name: '',
      category: '',
      subcategory: '',
      description: '',
      estimatedHours: 0,
      laborRate: 0,
    }
  });

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const newSelectedService: SelectedService = {
      id: service.id,
      serviceId: service.id,
      name: service.name,
      description: service.description,
      categoryName,
      subcategoryName,
      estimatedTime: service.estimatedTime,
      price: service.price,
      estimatedHours: service.estimatedTime ? service.estimatedTime / 60 : undefined,
      laborRate: service.price,
    };

    setSelectedServices(prev => [...prev, newSelectedService]);
    
    // Auto-fill the form with the first selected service
    if (selectedServices.length === 0) {
      form.setValue('name', service.name);
      form.setValue('category', categoryName);
      form.setValue('subcategory', subcategoryName);
      form.setValue('description', service.description || '');
      form.setValue('estimatedHours', service.estimatedTime ? service.estimatedTime / 60 : 0);
      form.setValue('laborRate', service.price || 0);
    }
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleUpdateServices = (services: SelectedService[]) => {
    setSelectedServices(services);
  };

  const handleSubmit = (values: JobLineFormValues) => {
    onSubmit(values);
  };

  if (categoriesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading services...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Services</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceSelectorAdapter
            categories={categories}
            onServiceSelect={handleServiceSelect}
            selectedServices={selectedServices}
            onRemoveService={handleRemoveService}
            onUpdateServices={handleUpdateServices}
          />
        </CardContent>
      </Card>

      {/* Job Line Form */}
      <Card>
        <CardHeader>
          <CardTitle>Job Line Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter service name" />
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
                        <Input {...field} placeholder="Service category" />
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
                        <Input {...field} placeholder="Service subcategory" />
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
                      <Textarea {...field} placeholder="Service description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Hours</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.5"
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          placeholder="0.0" 
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
                      <FormLabel>Labor Rate ($)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01"
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          placeholder="0.00" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Job Line'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
