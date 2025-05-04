
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2 } from 'lucide-react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob, CategoryColorStyle } from '@/types/serviceHierarchy';
import { v4 as uuidv4 } from 'uuid';

interface ServiceCategoryDetailsProps {
  category: ServiceMainCategory;
  onSave: (category: ServiceMainCategory) => void;
  onDelete: (categoryId: string) => void;
}

// Define color options for categories
const CATEGORY_COLORS: Record<string, CategoryColorStyle> = {
  green: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
  red: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  blue: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  purple: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  gray: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" },
};

export const ServiceCategoryDetails: React.FC<ServiceCategoryDetailsProps> = ({
  category,
  onSave,
  onDelete,
}) => {
  const [editedCategory, setEditedCategory] = useState<ServiceMainCategory>({...category});
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("blue");
  
  // Update local state when category prop changes
  useEffect(() => {
    setEditedCategory({...category});
    setSelectedSubcategory(null);
    setSelectedJob(null);
  }, [category]);
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedCategory(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => {
    onSave(editedCategory);
  };
  
  // Add a new subcategory
  const handleAddSubcategory = () => {
    const newSubcategory: ServiceSubcategory = {
      id: uuidv4(),
      name: "New Subcategory",
      description: "",
      jobs: [],
    };
    
    setEditedCategory(prev => ({
      ...prev,
      subcategories: prev.subcategories ? [...prev.subcategories, newSubcategory] : [newSubcategory],
    }));
    
    setSelectedSubcategory(newSubcategory.id);
    setSelectedJob(null);
  };
  
  // Delete a subcategory
  const handleDeleteSubcategory = (subcategoryId: string) => {
    setEditedCategory(prev => ({
      ...prev,
      subcategories: prev.subcategories?.filter(s => s.id !== subcategoryId) || [],
    }));
    
    if (selectedSubcategory === subcategoryId) {
      setSelectedSubcategory(null);
      setSelectedJob(null);
    }
  };
  
  // Update a subcategory
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, subcategoryId: string) => {
    const { name, value } = e.target;
    
    setEditedCategory(prev => ({
      ...prev,
      subcategories: prev.subcategories?.map(s => 
        s.id === subcategoryId ? { ...s, [name]: value } : s
      ) || [],
    }));
  };
  
  // Add a job to a subcategory
  const handleAddJob = (subcategoryId: string) => {
    const newJob: ServiceJob = {
      id: uuidv4(),
      name: "New Service",
      description: "",
      estimatedTime: 30,
      price: 0,
    };
    
    setEditedCategory(prev => ({
      ...prev,
      subcategories: prev.subcategories?.map(s => 
        s.id === subcategoryId ? 
        { 
          ...s, 
          jobs: s.jobs ? [...s.jobs, newJob] : [newJob],
        } : s
      ) || [],
    }));
    
    setSelectedSubcategory(subcategoryId);
    setSelectedJob(newJob.id);
  };
  
  // Delete a job
  const handleDeleteJob = (subcategoryId: string, jobId: string) => {
    setEditedCategory(prev => ({
      ...prev,
      subcategories: prev.subcategories?.map(s => 
        s.id === subcategoryId ? 
        { 
          ...s, 
          jobs: s.jobs?.filter(j => j.id !== jobId) || [],
        } : s
      ) || [],
    }));
    
    if (selectedJob === jobId) {
      setSelectedJob(null);
    }
  };
  
  // Update a job
  const handleJobChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, subcategoryId: string, jobId: string) => {
    const { name, value } = e.target;
    
    setEditedCategory(prev => ({
      ...prev,
      subcategories: prev.subcategories?.map(s => 
        s.id === subcategoryId ? 
        { 
          ...s, 
          jobs: s.jobs?.map(j => 
            j.id === jobId ? { ...j, [name]: name === 'price' || name === 'estimatedTime' ? parseFloat(value) || 0 : value } : j
          ) || [],
        } : s
      ) || [],
    }));
  };
  
  // Format price for display
  const formatPrice = (price: number | undefined): string => {
    if (price === undefined) return '';
    return price.toFixed(2);
  };
  
  // Format time from minutes to hours and minutes
  const formatTime = (minutes: number | undefined): string => {
    if (minutes === undefined) return '';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };
  
  // Parse time string (1h 30m) to minutes
  const parseTime = (timeStr: string): number => {
    let totalMinutes = 0;
    
    const hoursMatch = timeStr.match(/(\d+)h/);
    if (hoursMatch) {
      totalMinutes += parseInt(hoursMatch[1]) * 60;
    }
    
    const minutesMatch = timeStr.match(/(\d+)m/);
    if (minutesMatch) {
      totalMinutes += parseInt(minutesMatch[1]);
    }
    
    return totalMinutes || 0;
  };
  
  // Get current subcategory object
  const getSelectedSubcategory = (): ServiceSubcategory | undefined => {
    if (!selectedSubcategory) return undefined;
    return editedCategory.subcategories?.find(s => s.id === selectedSubcategory);
  };
  
  // Get current job object
  const getSelectedJob = (): ServiceJob | undefined => {
    if (!selectedSubcategory || !selectedJob) return undefined;
    const subcategory = getSelectedSubcategory();
    return subcategory?.jobs?.find(j => j.id === selectedJob);
  };
  
  return (
    <div className="flex flex-col space-y-6">
      {/* Category details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Category Details</h3>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Category
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this category?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the category "{editedCategory.name}" and all its subcategories and services.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => onDelete(editedCategory.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input 
              id="name" 
              name="name" 
              value={editedCategory.name || ''} 
              onChange={handleCategoryChange} 
              placeholder="Category name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Display Order</Label>
            <Input 
              id="position" 
              name="position" 
              type="number" 
              value={editedCategory.position || 0} 
              onChange={handleCategoryChange} 
              placeholder="0"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              value={editedCategory.description || ''} 
              onChange={handleCategoryChange} 
              placeholder="Category description"
              rows={2}
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORY_COLORS).map(([colorName, colorStyle]) => (
                <button
                  key={colorName}
                  type="button"
                  className={`px-3 py-1 rounded-full border ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border} ${
                    selectedColor === colorName ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedColor(colorName)}
                >
                  {colorName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Subcategories */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Subcategories</h3>
          <Button size="sm" onClick={handleAddSubcategory}>
            <Plus className="h-4 w-4 mr-1" />
            Add Subcategory
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {editedCategory.subcategories && editedCategory.subcategories.length > 0 ? (
            editedCategory.subcategories.map(subcategory => (
              <Card 
                key={subcategory.id} 
                className={`cursor-pointer border ${
                  selectedSubcategory === subcategory.id 
                    ? 'border-blue-500 shadow-md' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedSubcategory(subcategory.id);
                  setSelectedJob(null);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{subcategory.name}</h4>
                      {subcategory.description && (
                        <p className="text-sm text-gray-500 mt-1">{subcategory.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {subcategory.jobs?.length || 0} services
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-800 h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubcategory(subcategory.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="md:col-span-2 text-center p-4 border border-dashed rounded-md text-gray-500">
              No subcategories added yet. Click "Add Subcategory" to create one.
            </div>
          )}
        </div>
      </div>
      
      {/* Selected subcategory details */}
      {selectedSubcategory && getSelectedSubcategory() && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-medium">Subcategory Details</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subcategory-name">Subcategory Name</Label>
              <Input 
                id="subcategory-name" 
                name="name" 
                value={getSelectedSubcategory()?.name || ''} 
                onChange={(e) => handleSubcategoryChange(e, selectedSubcategory)} 
                placeholder="Subcategory name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory-description">Description</Label>
              <Textarea 
                id="subcategory-description" 
                name="description" 
                value={getSelectedSubcategory()?.description || ''} 
                onChange={(e) => handleSubcategoryChange(e, selectedSubcategory)} 
                placeholder="Subcategory description"
                rows={2}
              />
            </div>
          </div>
          
          {/* Jobs */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Services</h4>
              <Button size="sm" onClick={() => handleAddJob(selectedSubcategory)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Service
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getSelectedSubcategory()?.jobs && getSelectedSubcategory()?.jobs.length > 0 ? (
                    getSelectedSubcategory()?.jobs.map(job => (
                      <tr 
                        key={job.id} 
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedJob === job.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedJob(job.id)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{job.name}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            ${formatPrice(job.price)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatTime(job.estimatedTime)}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-800 h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteJob(selectedSubcategory, job.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                        No services added yet. Click "Add Service" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Selected job details */}
          {selectedJob && getSelectedJob() && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium">Service Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-name">Service Name</Label>
                  <Input 
                    id="job-name" 
                    name="name" 
                    value={getSelectedJob()?.name || ''} 
                    onChange={(e) => handleJobChange(e, selectedSubcategory, selectedJob)} 
                    placeholder="Service name"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="job-description">Description</Label>
                  <Textarea 
                    id="job-description" 
                    name="description" 
                    value={getSelectedJob()?.description || ''} 
                    onChange={(e) => handleJobChange(e, selectedSubcategory, selectedJob)} 
                    placeholder="Service description"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-price">Price ($)</Label>
                  <Input 
                    id="job-price" 
                    name="price" 
                    type="number" 
                    value={getSelectedJob()?.price || ''} 
                    onChange={(e) => handleJobChange(e, selectedSubcategory, selectedJob)} 
                    placeholder="0.00"
                    step={0.01}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-time">Estimated Time (minutes)</Label>
                  <Input 
                    id="job-time" 
                    name="estimatedTime" 
                    type="number" 
                    value={getSelectedJob()?.estimatedTime || ''} 
                    onChange={(e) => handleJobChange(e, selectedSubcategory, selectedJob)} 
                    placeholder="0"
                    step={5}
                  />
                  <p className="text-xs text-gray-500">
                    {formatTime(getSelectedJob()?.estimatedTime)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Save button */}
      <div className="pt-4 border-t flex justify-end">
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};
