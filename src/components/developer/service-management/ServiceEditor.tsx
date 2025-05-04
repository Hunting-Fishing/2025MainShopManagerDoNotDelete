
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface ServiceEditorProps {
  category: ServiceMainCategory | null;
  subcategory: ServiceSubcategory | null;
  job: ServiceJob | null;
  onSave: (
    category: ServiceMainCategory | null,
    subcategory: ServiceSubcategory | null,
    job: ServiceJob | null
  ) => void;
  onCancel: () => void;
}

const ServiceEditor: React.FC<ServiceEditorProps> = ({
  category,
  subcategory,
  job,
  onSave,
  onCancel
}) => {
  const [editedCategory, setEditedCategory] = useState<ServiceMainCategory | null>(null);
  const [editedSubcategory, setEditedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [editedJob, setEditedJob] = useState<ServiceJob | null>(null);

  // Set initial state when props change
  useEffect(() => {
    setEditedCategory(category ? { ...category } : null);
    setEditedSubcategory(subcategory ? { ...subcategory } : null);
    setEditedJob(job ? { ...job } : null);
  }, [category, subcategory, job]);

  // Handle name change for category
  const handleCategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedCategory) return;
    setEditedCategory({
      ...editedCategory,
      name: e.target.value
    });
  };

  // Handle description change for category
  const handleCategoryDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editedCategory) return;
    setEditedCategory({
      ...editedCategory,
      description: e.target.value
    });
  };

  // Handle name change for subcategory
  const handleSubcategoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedSubcategory) return;
    setEditedSubcategory({
      ...editedSubcategory,
      name: e.target.value
    });
  };

  // Handle description change for subcategory
  const handleSubcategoryDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editedSubcategory) return;
    setEditedSubcategory({
      ...editedSubcategory,
      description: e.target.value
    });
  };

  // Handle name change for job
  const handleJobNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedJob) return;
    setEditedJob({
      ...editedJob,
      name: e.target.value
    });
  };

  // Handle description change for job
  const handleJobDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!editedJob) return;
    setEditedJob({
      ...editedJob,
      description: e.target.value
    });
  };

  // Handle price change for job
  const handleJobPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedJob) return;
    const price = parseFloat(e.target.value) || 0;
    setEditedJob({
      ...editedJob,
      price
    });
  };

  // Handle time change for job
  const handleJobTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedJob) return;
    const time = parseInt(e.target.value) || 0;
    setEditedJob({
      ...editedJob,
      estimatedTime: time
    });
  };

  // Handle save button click
  const handleSave = () => {
    onSave(editedCategory, editedSubcategory, editedJob);
  };

  // Determine what is being edited
  const isEditingCategory = !!editedCategory && !editedSubcategory && !editedJob;
  const isEditingSubcategory = !!editedCategory && !!editedSubcategory && !editedJob;
  const isEditingJob = !!editedCategory && !!editedSubcategory && !!editedJob;

  return (
    <Card className="border border-gray-200 rounded-xl shadow-sm">
      <CardHeader className="pb-3 border-b">
        <CardTitle>
          {isEditingJob 
            ? 'Edit Service' 
            : isEditingSubcategory 
            ? 'Edit Subcategory' 
            : 'Edit Category'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {isEditingCategory && editedCategory && (
            <>
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={editedCategory.name}
                  onChange={handleCategoryNameChange}
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-desc">Description</Label>
                <Textarea
                  id="category-desc"
                  value={editedCategory.description || ''}
                  onChange={handleCategoryDescChange}
                  placeholder="Enter category description"
                  className="border-gray-300"
                />
              </div>
            </>
          )}

          {isEditingSubcategory && editedSubcategory && (
            <>
              <div className="space-y-2">
                <Label htmlFor="subcategory-name">Subcategory Name</Label>
                <Input
                  id="subcategory-name"
                  value={editedSubcategory.name}
                  onChange={handleSubcategoryNameChange}
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory-desc">Description</Label>
                <Textarea
                  id="subcategory-desc"
                  value={editedSubcategory.description || ''}
                  onChange={handleSubcategoryDescChange}
                  placeholder="Enter subcategory description"
                  className="border-gray-300"
                />
              </div>
            </>
          )}

          {isEditingJob && editedJob && (
            <>
              <div className="space-y-2">
                <Label htmlFor="job-name">Service Name</Label>
                <Input
                  id="job-name"
                  value={editedJob.name}
                  onChange={handleJobNameChange}
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-desc">Description</Label>
                <Textarea
                  id="job-desc"
                  value={editedJob.description || ''}
                  onChange={handleJobDescChange}
                  placeholder="Enter service description"
                  className="border-gray-300"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job-price">Price ($)</Label>
                  <Input
                    id="job-price"
                    type="number"
                    value={editedJob.price || 0}
                    onChange={handleJobPriceChange}
                    min={0}
                    step={0.01}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job-time">Estimated Time (minutes)</Label>
                  <Input
                    id="job-time"
                    type="number"
                    value={editedJob.estimatedTime || 0}
                    onChange={handleJobTimeChange}
                    min={0}
                    className="border-gray-300"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceEditor;
