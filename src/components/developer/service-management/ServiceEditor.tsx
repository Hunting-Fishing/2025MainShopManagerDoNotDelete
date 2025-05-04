
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  createEmptyCategory,
  createEmptySubcategory,
  createEmptyJob,
  formatTime
} from '@/lib/services/serviceUtils';

type EditorMode = 'category' | 'subcategory' | 'job' | 'none';

interface ServiceEditorProps {
  category?: ServiceMainCategory;
  subcategory?: ServiceSubcategory;
  job?: ServiceJob;
  mode: EditorMode;
  onSave: (
    data: ServiceMainCategory | ServiceSubcategory | ServiceJob, 
    mode: EditorMode,
    parentIds?: { categoryId?: string; subcategoryId?: string }
  ) => void;
  onCancel: () => void;
  onDelete?: (
    id: string, 
    mode: EditorMode,
    parentIds?: { categoryId?: string; subcategoryId?: string }
  ) => void;
}

interface BasicFormData {
  name: string;
  description: string;
  position?: number;
}

interface JobFormData extends BasicFormData {
  estimatedTime: number;
  price: number;
}

export const ServiceEditor: React.FC<ServiceEditorProps> = ({
  category,
  subcategory,
  job,
  mode,
  onSave,
  onCancel,
  onDelete
}) => {
  const [currentTab, setCurrentTab] = useState<string>("basic");

  // Form setup based on mode
  const basicForm = useForm<BasicFormData>({
    defaultValues: {
      name: '',
      description: '',
      position: 0,
    }
  });

  const jobForm = useForm<JobFormData>({
    defaultValues: {
      name: '',
      description: '',
      estimatedTime: 60, // 1 hour default
      price: 0
    }
  });

  // Set form default values based on the edited item
  useEffect(() => {
    if (mode === 'category' && category) {
      basicForm.reset({
        name: category.name,
        description: category.description || '',
        position: category.position || 0
      });
    } else if (mode === 'subcategory' && subcategory) {
      basicForm.reset({
        name: subcategory.name,
        description: subcategory.description || ''
      });
    } else if (mode === 'job' && job) {
      jobForm.reset({
        name: job.name,
        description: job.description || '',
        estimatedTime: job.estimatedTime || 60,
        price: job.price || 0
      });
    }
  }, [category, subcategory, job, mode, basicForm, jobForm]);

  const getTitle = () => {
    switch (mode) {
      case 'category':
        return category?.id ? 'Edit Category' : 'Add New Category';
      case 'subcategory':
        return subcategory?.id ? 'Edit Subcategory' : 'Add New Subcategory';
      case 'job':
        return job?.id ? 'Edit Job' : 'Add New Job';
      default:
        return 'Select an item to edit';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'category':
        return 'Edit the main category details';
      case 'subcategory':
        return `Subcategory under ${category?.name || 'category'}`;
      case 'job':
        return `Job under ${category?.name || 'category'} > ${subcategory?.name || 'subcategory'}`;
      default:
        return 'No item selected';
    }
  };

  // Handle basic form submit
  const handleBasicSubmit = (data: BasicFormData) => {
    if (mode === 'category') {
      const updatedCategory: ServiceMainCategory = {
        ...(category || createEmptyCategory()),
        name: data.name,
        description: data.description,
        position: data.position
      };
      onSave(updatedCategory, 'category');
      toast({
        title: "Category saved",
        description: `Category "${data.name}" has been saved successfully.`
      });
    } else if (mode === 'subcategory') {
      const updatedSubcategory: ServiceSubcategory = {
        ...(subcategory || createEmptySubcategory()),
        name: data.name,
        description: data.description
      };
      onSave(updatedSubcategory, 'subcategory', { 
        categoryId: category?.id 
      });
      toast({
        title: "Subcategory saved",
        description: `Subcategory "${data.name}" has been saved successfully.`
      });
    }
  };

  // Handle job form submit
  const handleJobSubmit = (data: JobFormData) => {
    if (mode === 'job') {
      const updatedJob: ServiceJob = {
        ...(job || createEmptyJob()),
        name: data.name,
        description: data.description,
        estimatedTime: data.estimatedTime,
        price: data.price
      };
      onSave(updatedJob, 'job', {
        categoryId: category?.id,
        subcategoryId: subcategory?.id
      });
      toast({
        title: "Job saved",
        description: `Job "${data.name}" has been saved successfully.`
      });
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (!onDelete) return;

    if (window.confirm(`Are you sure you want to delete this ${mode}?`)) {
      if (mode === 'category' && category) {
        onDelete(category.id, 'category');
      } else if (mode === 'subcategory' && subcategory) {
        onDelete(subcategory.id, 'subcategory', { categoryId: category?.id });
      } else if (mode === 'job' && job) {
        onDelete(job.id, 'job', {
          categoryId: category?.id,
          subcategoryId: subcategory?.id
        });
      }
    }
  };

  // Return an empty state if no mode is selected
  if (mode === 'none') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Service Editor</CardTitle>
          <CardDescription>Select an item from the list to edit</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p>No item selected</p>
            <p className="text-sm mt-2">Click on any category, subcategory, or job from the list to edit it.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        {mode === 'job' ? (
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Time</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <Form {...jobForm}>
                <form className="space-y-4 mt-4">
                  <FormField
                    control={jobForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter job name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={jobForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Enter job description"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="pricing">
              <Form {...jobForm}>
                <form className="space-y-4 mt-4">
                  <FormField
                    control={jobForm.control}
                    name="estimatedTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Time (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>
                          Current: {formatTime(field.value)}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={jobForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        ) : (
          <Form {...basicForm}>
            <form className="space-y-4">
              <FormField
                control={basicForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{mode === 'category' ? 'Category Name' : 'Subcategory Name'}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={`Enter ${mode} name`} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={basicForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder={`Enter ${mode} description`}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {mode === 'category' && (
                <FormField
                  control={basicForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/10 p-4">
        <div>
          {onDelete && (mode === 'category' ? category?.id : mode === 'subcategory' ? subcategory?.id : job?.id) && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={mode === 'job' ? 
              jobForm.handleSubmit(handleJobSubmit) : 
              basicForm.handleSubmit(handleBasicSubmit)
            }
          >
            Save
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
