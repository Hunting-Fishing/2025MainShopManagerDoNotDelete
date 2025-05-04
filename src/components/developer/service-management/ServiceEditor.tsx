
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { Save, Undo, Clock, DollarSign } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ServiceEditorProps {
  selectedCategory: ServiceMainCategory | null;
  selectedSubcategory: ServiceSubcategory | null;
  selectedJob: ServiceJob | null;
  onSave: (updatedCategory: ServiceMainCategory) => void;
}

export function ServiceEditor({
  selectedCategory,
  selectedSubcategory,
  selectedJob,
  onSave
}: ServiceEditorProps) {
  const { toast } = useToast();
  
  // State for editing
  const [editedName, setEditedName] = useState<string>('');
  const [editedDescription, setEditedDescription] = useState<string>('');
  const [editedPrice, setEditedPrice] = useState<string>('');
  const [editedTime, setEditedTime] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isValidForm, setIsValidForm] = useState<boolean>(true);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  // Reset form when selection changes
  useEffect(() => {
    if (selectedJob) {
      setEditedName(selectedJob.name);
      setEditedDescription(selectedJob.description || '');
      setEditedPrice(selectedJob.price?.toString() || '0');
      setEditedTime(selectedJob.estimatedTime?.toString() || '60');
    } else if (selectedSubcategory) {
      setEditedName(selectedSubcategory.name);
      setEditedDescription(selectedSubcategory.description || '');
      setEditedPrice('');
      setEditedTime('');
    } else if (selectedCategory) {
      setEditedName(selectedCategory.name);
      setEditedDescription(selectedCategory.description || '');
      setEditedPrice('');
      setEditedTime('');
    } else {
      setEditedName('');
      setEditedDescription('');
      setEditedPrice('');
      setEditedTime('');
    }
    
    setIsDirty(false);
    setValidationErrors({});
  }, [selectedCategory, selectedSubcategory, selectedJob]);
  
  // Validate form
  useEffect(() => {
    const errors: {[key: string]: string} = {};
    
    if (!editedName.trim()) {
      errors.name = 'Name is required';
    }
    
    if (selectedJob) {
      const price = parseFloat(editedPrice);
      if (isNaN(price) || price < 0) {
        errors.price = 'Price must be a positive number';
      }
      
      const time = parseInt(editedTime);
      if (isNaN(time) || time <= 0) {
        errors.time = 'Time must be a positive number';
      }
    }
    
    setValidationErrors(errors);
    setIsValidForm(Object.keys(errors).length === 0);
  }, [editedName, editedPrice, editedTime, selectedJob]);

  // Save changes
  const handleSave = () => {
    if (!selectedCategory || !isValidForm) return;
    
    let updatedCategory: ServiceMainCategory;
    
    if (selectedJob && selectedSubcategory) {
      // Update job
      const updatedJob: ServiceJob = {
        ...selectedJob,
        name: editedName,
        description: editedDescription,
        price: parseFloat(editedPrice),
        estimatedTime: parseInt(editedTime)
      };
      
      const updatedSubcategory: ServiceSubcategory = {
        ...selectedSubcategory,
        jobs: selectedSubcategory.jobs?.map(job => job.id === selectedJob.id ? updatedJob : job)
      };
      
      updatedCategory = {
        ...selectedCategory,
        subcategories: selectedCategory.subcategories?.map(sub => 
          sub.id === selectedSubcategory.id ? updatedSubcategory : sub
        )
      };
    } else if (selectedSubcategory) {
      // Update subcategory
      const updatedSubcategory: ServiceSubcategory = {
        ...selectedSubcategory,
        name: editedName,
        description: editedDescription
      };
      
      updatedCategory = {
        ...selectedCategory,
        subcategories: selectedCategory.subcategories?.map(sub => 
          sub.id === selectedSubcategory.id ? updatedSubcategory : sub
        )
      };
    } else {
      // Update category
      updatedCategory = {
        ...selectedCategory,
        name: editedName,
        description: editedDescription
      };
    }
    
    onSave(updatedCategory);
    setIsDirty(false);
    toast({
      title: "Changes saved",
      description: `Updated ${selectedJob ? 'job' : selectedSubcategory ? 'subcategory' : 'category'} details`,
    });
  };

  // Reset form
  const handleReset = () => {
    if (selectedJob) {
      setEditedName(selectedJob.name);
      setEditedDescription(selectedJob.description || '');
      setEditedPrice(selectedJob.price?.toString() || '0');
      setEditedTime(selectedJob.estimatedTime?.toString() || '60');
    } else if (selectedSubcategory) {
      setEditedName(selectedSubcategory.name);
      setEditedDescription(selectedSubcategory.description || '');
    } else if (selectedCategory) {
      setEditedName(selectedCategory.name);
      setEditedDescription(selectedCategory.description || '');
    }
    
    setIsDirty(false);
    setValidationErrors({});
  };

  // Mark form as dirty when changes are made
  const handleChange = (fieldName: string, value: string) => {
    switch (fieldName) {
      case 'name':
        setEditedName(value);
        break;
      case 'description':
        setEditedDescription(value);
        break;
      case 'price':
        setEditedPrice(value);
        break;
      case 'time':
        setEditedTime(value);
        break;
    }
    
    setIsDirty(true);
  };

  // Format time display
  const formatTimeDisplay = (minutes: number): string => {
    if (!minutes) return '0 min';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  };

  // If nothing is selected
  if (!selectedCategory) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <div className="mb-2 text-lg font-medium">No Item Selected</div>
        <p className="text-slate-500">Select a category, subcategory, or job from the left panel to edit</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          {selectedJob ? 'Edit Job' : selectedSubcategory ? 'Edit Subcategory' : 'Edit Category'}
        </h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleReset}
            disabled={!isDirty}
          >
            <Undo className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
            disabled={!isDirty || !isValidForm}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Breadcrumb navigation */}
      <div className="text-xs text-slate-500 space-x-1 flex items-center mb-4">
        <span className="font-medium">{selectedCategory.name}</span>
        {selectedSubcategory && (
          <>
            <span>/</span>
            <span className="font-medium">{selectedSubcategory.name}</span>
          </>
        )}
        {selectedJob && (
          <>
            <span>/</span>
            <span className="font-medium">{selectedJob.name}</span>
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Name</Label>
          <Input
            id="name"
            value={editedName}
            onChange={(e) => handleChange('name', e.target.value)}
            className={validationErrors.name ? "border-red-300" : ""}
          />
          {validationErrors.name && (
            <p className="text-xs text-red-500">{validationErrors.name}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
          <Textarea
            id="description"
            value={editedDescription}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
          />
        </div>
        
        {selectedJob && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="price" className="text-sm font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                    Price
                  </Label>
                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                      <Input
                        id="price"
                        type="number"
                        value={editedPrice}
                        onChange={(e) => handleChange('price', e.target.value)}
                        className={`pl-8 ${validationErrors.price ? "border-red-300" : ""}`}
                      />
                    </div>
                    {validationErrors.price && (
                      <p className="text-xs text-red-500">{validationErrors.price}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="time" className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-blue-600" />
                    Estimated Time
                  </Label>
                  <div>
                    <div className="flex items-center gap-2">
                      <Input
                        id="time"
                        type="number"
                        value={editedTime}
                        onChange={(e) => handleChange('time', e.target.value)}
                        className={`w-24 ${validationErrors.time ? "border-red-300" : ""}`}
                      />
                      <span className="text-sm text-slate-500">minutes</span>
                    </div>
                    {validationErrors.time ? (
                      <p className="text-xs text-red-500">{validationErrors.time}</p>
                    ) : (
                      <p className="text-xs text-slate-500 text-right">
                        {formatTimeDisplay(parseInt(editedTime) || 0)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
