
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Label } from '@/components/ui/label';
import { formatTime } from '@/lib/services/serviceUtils';
import { Save, X, Clock, DollarSign } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ServiceEditorProps {
  selectedCategory: ServiceMainCategory | null;
  selectedSubcategory: ServiceSubcategory | null;
  selectedJob: ServiceJob | null;
  onSave: (
    category: ServiceMainCategory | null,
    subcategory: ServiceSubcategory | null,
    job: ServiceJob | null
  ) => void;
  onCancel: () => void;
}

export const ServiceEditor: React.FC<ServiceEditorProps> = ({
  selectedCategory,
  selectedSubcategory,
  selectedJob,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const [editedCategory, setEditedCategory] = useState<ServiceMainCategory | null>(null);
  const [editedSubcategory, setEditedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [editedJob, setEditedJob] = useState<ServiceJob | null>(null);
  const [isEditing, setIsEditing] = useState<'category' | 'subcategory' | 'job' | null>(null);
  
  useEffect(() => {
    // Deep clone the selected items to avoid direct mutation
    setEditedCategory(selectedCategory ? JSON.parse(JSON.stringify(selectedCategory)) : null);
    setEditedSubcategory(selectedSubcategory ? JSON.parse(JSON.stringify(selectedSubcategory)) : null);
    setEditedJob(selectedJob ? JSON.parse(JSON.stringify(selectedJob)) : null);
    
    // Set what we're currently editing based on selection
    if (selectedJob) {
      setIsEditing('job');
    } else if (selectedSubcategory) {
      setIsEditing('subcategory');
    } else if (selectedCategory) {
      setIsEditing('category');
    } else {
      setIsEditing(null);
    }
  }, [selectedCategory, selectedSubcategory, selectedJob]);

  const handleSave = () => {
    if (!isEditing) return;
    
    // Basic validation
    if (isEditing === 'category' && editedCategory && !editedCategory.name.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Category name cannot be empty", 
        variant: "destructive" 
      });
      return;
    }
    
    if (isEditing === 'subcategory' && editedSubcategory && !editedSubcategory.name.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Subcategory name cannot be empty", 
        variant: "destructive" 
      });
      return;
    }
    
    if (isEditing === 'job' && editedJob && !editedJob.name.trim()) {
      toast({ 
        title: "Validation Error", 
        description: "Service name cannot be empty", 
        variant: "destructive" 
      });
      return;
    }
    
    onSave(editedCategory, editedSubcategory, editedJob);
    toast({ 
      title: "Success", 
      description: `${isEditing.charAt(0).toUpperCase() + isEditing.slice(1)} saved successfully!`,
    });
  };

  if (!isEditing) {
    return (
      <Card className="h-full flex items-center justify-center text-center p-6">
        <CardContent>
          <p className="text-gray-500">Select a category, subcategory, or service to edit.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {isEditing === 'category' && 'Edit Category'}
          {isEditing === 'subcategory' && 'Edit Subcategory'}
          {isEditing === 'job' && 'Edit Service'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEditing === 'category' && editedCategory && (
          <>
            <FormField
              name="categoryName"
              render={() => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <Input
                    value={editedCategory.name}
                    onChange={(e) => setEditedCategory({...editedCategory, name: e.target.value})}
                    className="w-full"
                    placeholder="Category name"
                  />
                </FormItem>
              )}
            />
            <FormField
              name="categoryDescription"
              render={() => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={editedCategory.description || ''}
                    onChange={(e) => setEditedCategory({...editedCategory, description: e.target.value})}
                    placeholder="Category description"
                    rows={4}
                  />
                </FormItem>
              )}
            />
            <FormField
              name="position"
              render={() => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Input
                    type="number"
                    value={editedCategory.position || 0}
                    onChange={(e) => setEditedCategory({...editedCategory, position: parseInt(e.target.value) || 0})}
                    className="w-full"
                  />
                </FormItem>
              )}
            />
          </>
        )}

        {isEditing === 'subcategory' && editedSubcategory && (
          <>
            <FormField
              name="subcategoryName"
              render={() => (
                <FormItem>
                  <FormLabel>Subcategory Name</FormLabel>
                  <Input
                    value={editedSubcategory.name}
                    onChange={(e) => setEditedSubcategory({...editedSubcategory, name: e.target.value})}
                    className="w-full"
                    placeholder="Subcategory name"
                  />
                </FormItem>
              )}
            />
            <FormField
              name="subcategoryDescription"
              render={() => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={editedSubcategory.description || ''}
                    onChange={(e) => setEditedSubcategory({...editedSubcategory, description: e.target.value})}
                    placeholder="Subcategory description"
                    rows={4}
                  />
                </FormItem>
              )}
            />
          </>
        )}

        {isEditing === 'job' && editedJob && (
          <>
            <FormField
              name="serviceName"
              render={() => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <Input
                    value={editedJob.name}
                    onChange={(e) => setEditedJob({...editedJob, name: e.target.value})}
                    className="w-full"
                    placeholder="Service name"
                  />
                </FormItem>
              )}
            />
            <FormField
              name="serviceDescription"
              render={() => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={editedJob.description || ''}
                    onChange={(e) => setEditedJob({...editedJob, description: e.target.value})}
                    placeholder="Service description"
                    rows={3}
                  />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="estimatedTime"
                render={() => (
                  <FormItem>
                    <FormLabel>Estimated Time (minutes)</FormLabel>
                    <div className="relative">
                      <Input
                        type="number"
                        value={editedJob.estimatedTime || 0}
                        onChange={(e) => setEditedJob({...editedJob, estimatedTime: parseInt(e.target.value) || 0})}
                        className="w-full pl-9"
                      />
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatTime(editedJob.estimatedTime || 0)}
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                name="price"
                render={() => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        value={editedJob.price || 0}
                        onChange={(e) => setEditedJob({...editedJob, price: parseFloat(e.target.value) || 0})}
                        className="w-full pl-9"
                      />
                      <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} className="flex items-center">
          <X className="mr-1.5 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 flex items-center">
          <Save className="mr-1.5 h-4 w-4" />
          Save {isEditing}
        </Button>
      </CardFooter>
    </Card>
  );
};
